#!/usr/bin/env bash
# Stream a built documentation archive to a web server over SSH.
#
# Usage: deploy-site.sh <archive.tar.gz>
#
# The deploy account on the server accepts the single command `deploy-docs`:
# it reads the .tar.gz on standard input and unpacks it under /docs/ of the
# developer site. Environment (set by the workflow from repository secrets):
#   DEPLOY_PLATFORM  label used in log output (test, production)
#   DEPLOY_HOST      server address
#   DEPLOY_USER      deploy account
#   DEPLOY_SSH_KEY   private key text
#   DEPLOY_HOST_KEY  the server's public host key line (ssh-keyscan output)
# Missing credentials fail the deployment; release publication is a separate job.
set -euo pipefail

archive=${1:?usage: deploy-site.sh <archive.tar.gz>}
platform=${DEPLOY_PLATFORM:-unnamed}

: "${DEPLOY_SSH_KEY:?DEPLOY_SSH_KEY is required}"
: "${DEPLOY_HOST:?DEPLOY_HOST is required}"
: "${DEPLOY_USER:?DEPLOY_USER is required}"
: "${DEPLOY_HOST_KEY:?DEPLOY_HOST_KEY is required}"
[ -f "$archive" ] || { echo "archive not found: $archive" >&2; exit 1; }

dist=$(dirname "$archive")
(cd "$dist" && sha256sum -c --ignore-missing SHA256SUMS)
node scripts/verify-deployment.mjs "$archive" "$platform"
# Read the whole listing first, then match it in the shell. Any pipe into
# `grep -q` can fail under pipefail when grep exits early and the writer
# (tar, or printf for a large listing) receives SIGPIPE.
names=$(tar -tzf "$archive")
case $'\n'"$names"$'\n' in
  *$'\nindex.html\n'* | *$'\n./index.html\n'*) ;;
  *) echo "archive root must contain index.html" >&2; exit 1 ;;
esac

ssh_dir=$(mktemp -d)
trap 'rm -rf "$ssh_dir"' EXIT
printf '%s\n' "$DEPLOY_HOST_KEY" > "$ssh_dir/known_hosts"
printf '%s\n' "$DEPLOY_SSH_KEY" > "$ssh_dir/key"
chmod 600 "$ssh_dir/key"

echo "Deploying $archive to the $platform platform ($DEPLOY_USER@$DEPLOY_HOST)"
ssh -i "$ssh_dir/key" -o IdentitiesOnly=yes -o BatchMode=yes \
    -o UserKnownHostsFile="$ssh_dir/known_hosts" -o StrictHostKeyChecking=yes \
    -o ConnectTimeout=20 "$DEPLOY_USER@$DEPLOY_HOST" deploy-docs < "$archive"

case "$platform" in
  test) site_url=https://developer.inhand.online/docs/ ;;
  production) site_url=https://developer.inhand.com/docs/ ;;
  *) echo "Unknown deployment platform" >&2; exit 1 ;;
esac
curl --fail --silent --show-error --noproxy '*' --retry 4 --retry-all-errors \
  --connect-timeout 15 --max-time 60 \
  "${site_url}deployment.json?version=${VERSION}" -o "$ssh_dir/live.json"
node scripts/verify-deployment.mjs "$archive" "$platform" "$ssh_dir/live.json"
