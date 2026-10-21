# Source this file, do not execute it: source ./activate_host.sh ./host
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
    printf '%s\n' 'Use: source ./activate_host.sh ./host' >&2
    exit 1
fi
zone_host_dir=$(cd -- "${1:-host}" && pwd) || return 1
source "$zone_host_dir/venv/bin/activate" || return 1
export SOC=AM62A
export TIDL_TOOLS_PATH="$zone_host_dir/tidl_tools"
export LD_LIBRARY_PATH="$TIDL_TOOLS_PATH${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export PYTHONDONTWRITEBYTECODE=1
unset zone_host_dir
python -c "import onnxruntime as o; print(o.__version__, o.get_available_providers()); assert o.__version__ == '1.23.0'; assert 'TIDLCompilationProvider' in o.get_available_providers()"
