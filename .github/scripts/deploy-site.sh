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
# The script succeeds without deploying while DEPLOY_SSH_KEY is empty, so a
# platform can be added later by setting its secrets.
set -euo pipefail

archive=${1:?usage: deploy-site.sh <archive.tar.gz>}
platform=${DEPLOY_PLATFORM:-unnamed}

if [ -z "${DEPLOY_SSH_KEY:-}" ]; then
  echo "The $platform platform SSH key is not set; skipping its deployment."
  exit 0
fi
: "${DEPLOY_HOST:?DEPLOY_HOST is required}"
: "${DEPLOY_USER:?DEPLOY_USER is required}"
: "${DEPLOY_HOST_KEY:?DEPLOY_HOST_KEY is required}"
[ -f "$archive" ] || { echo "archive not found: $archive" >&2; exit 1; }

dist=$(dirname "$archive")
(cd "$dist" && sha256sum -c --ignore-missing SHA256SUMS)
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
