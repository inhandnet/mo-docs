#!/usr/bin/env bash
# Create an isolated ONNX-only host toolchain. No sudo, target access or global pip.
set -euo pipefail
test "$(uname -m)" = x86_64
python3.10 -c 'import sys; assert sys.version_info[:2] == (3, 10)'
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
work=${1:-host}
if test -e "$work"; then
    printf '%s\n' 'Refusing to replace an existing host directory.' >&2
    exit 1
fi
mkdir -- "$work"
work=$(cd -- "$work" && pwd)
git clone --branch 11_02_17_00 --depth 1 \
    https://github.com/TexasInstruments/edgeai-tidl-tools.git "$work/edgeai-tidl-tools"
test "$(git -C "$work/edgeai-tidl-tools" rev-parse HEAD)" = d2be7203e5680298d7f54bcbd38e299d1bc22bfd
if python3.10 -c 'import ensurepip' 2>/dev/null; then
    python3.10 -m venv "$work/venv"
else
    # Some managed Python installations omit ensurepip. A modern external pip
    # can bootstrap this venv without installing into the global interpreter.
    python3.10 -m pip --help | grep -q -- '--python'
    python3.10 -m venv --without-pip "$work/venv"
    python3.10 -m pip --python "$work/venv/bin/python" install pip==25.3
fi
"$work/venv/bin/python" -m pip install pip==25.3
"$work/venv/bin/python" -m pip install -r "$script_dir/requirements-host.txt"
mkdir -- "$work/downloads"
curl --fail --location --retry 2 \
    https://software-dl.ti.com/jacinto7/esd/tidl-tools/11_02_17_00/TIDL_TOOLS/AM62A/tidl_tools.tar.gz \
    --output "$work/downloads/tidl_tools.tar.gz"
printf '%s  %s\n' 303ca8a54250e5c09d842206b4f430381be68fd250ecf1c49ab9376a87c34e16 \
    "$work/downloads/tidl_tools.tar.gz" | sha256sum --check --status
tar -xzf "$work/downloads/tidl_tools.tar.gz" -C "$work"
grep -Fx 'BRANCH=REL.TIDL.11.02.17.00' "$work/tidl_tools/version.txt"
grep -Fx 'COMMIT_ID=6f5289fd1c17cf03ff21caa842c9706a06e11fcc' "$work/tidl_tools/version.txt"
"$work/venv/bin/python" -m pip check
printf '%s\n' 'Host setup complete. Source activate_host.sh with the same directory in each new shell.'
