"""Compile the unchanged official 8210 model with the pinned x86 AM62A toolchain."""
import argparse
import json
import os
from pathlib import Path
import platform
import time

import cv2
import onnxruntime as ort

from model import MODEL_NAME, check_sources, preprocess, sha256, write_json

parser = argparse.ArgumentParser()
parser.add_argument('--bundle', type=Path, required=True)
parser.add_argument('--calibration', type=Path, required=True)
parser.add_argument('--iterations', type=int, default=3)
args = parser.parse_args()
bundle = args.bundle.resolve()
check_sources(bundle)
if platform.machine() != 'x86_64' or os.environ.get('SOC') != 'AM62A':
    raise RuntimeError('Compile on x86_64 with SOC=AM62A')
tools = Path(os.environ['TIDL_TOOLS_PATH']).resolve()
if 'REL.TIDL.11.02.17.00' not in (tools / 'version.txt').read_text():
    raise RuntimeError('Compiler baseline differs')
if ort.__version__ != '1.23.0' or 'TIDLCompilationProvider' not in ort.get_available_providers():
    raise RuntimeError('Activate the pinned TI ONNX Runtime environment')
manifest = json.loads((args.calibration / 'inputs.json').read_text())
frames = manifest['frames']
if len(frames) < 16 or args.iterations < 1:
    raise ValueError('This example requires at least 16 representative calibration frames and a positive iteration count')
for frame in frames:
    path = args.calibration / frame['file']
    if path.parent != args.calibration or sha256(path) != frame['sha256']:
        raise ValueError('Calibration frame checksum/path failed')
(bundle / 'artifacts').mkdir(exist_ok=False)
# Preserve the selection set in TI's exact model config, removing only a duplicate.
upstream_16bit = '1033,711,712,713,727,728,728,743,744,745'
selected_16bit = ','.join(dict.fromkeys(upstream_16bit.split(',')))
options = {'tidl_tools_path': str(tools), 'artifacts_folder': str(bundle / 'artifacts'),
           'tensor_bits': 8, 'accuracy_level': 1, 'debug_level': 1,
           'advanced_options:calibration_frames': len(frames),
           'advanced_options:calibration_iterations': args.iterations,
           'advanced_options:quantization_scale_type': 4,
           'advanced_options:add_data_convert_ops': 3,
           'advanced_options:output_feature_16bit_names_list': selected_16bit,
           'object_detection:meta_arch_type': 6,
           'object_detection:meta_layers_names_list': str(bundle / 'model' / (MODEL_NAME + '.prototxt')),
           'object_detection:confidence_threshold': 0.3, 'object_detection:top_k': 200}
print(json.dumps(options, indent=2), flush=True)
settings = ort.SessionOptions()
settings.intra_op_num_threads = 1
settings.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
settings.add_session_config_entry('session.disable_input_validation', '1')
settings.add_session_config_entry('session.disable_output_validation', '1')
started = time.monotonic()
session = ort.InferenceSession(str(bundle / 'model' / (MODEL_NAME + '.onnx')), sess_options=settings,
                              providers=['TIDLCompilationProvider', 'CPUExecutionProvider'],
                              provider_options=[options, {}])
for index, frame in enumerate(frames):
    tensor, _ = preprocess(cv2.imread(str(args.calibration / frame['file'])))
    session.run(None, {session.get_inputs()[0].name: tensor})
    print(f'Calibration {index + 1}/{len(frames)}: {frame["file"]}', flush=True)
networks, io = list((bundle / 'artifacts').glob('*_net.bin')), list((bundle / 'artifacts').glob('*_io_*.bin'))
if not networks or len(networks) != len(io):
    raise RuntimeError('Incomplete network/IO artifacts')
files = sorted([*(bundle / 'model').iterdir(), *(bundle / 'artifacts').iterdir()])
record = {'soc': 'AM62A', 'tidl_release': '11_02_17_00',
          'tool_source_commit': 'd2be7203e5680298d7f54bcbd38e299d1bc22bfd',
          'compiler_version': (tools / 'version.txt').read_text(), 'host_python': platform.python_version(),
          'onnxruntime': ort.__version__, 'model_id': 'od-8210',
          'quantization': {'base_bits': 8, 'scale_type': 4, 'iterations': args.iterations,
                           'selected_16bit_outputs': selected_16bit},
          'calibration': manifest, 'elapsed_seconds': time.monotonic() - started,
          'files': {str(p.relative_to(bundle)): sha256(p) for p in files if p.is_file()},
          'scope': 'Compilation record only; target output, accuracy and stability still require separate validation'}
write_json(bundle / 'bundle.json', record)
print('Compilation finished; inspect diagnostics and compare CPU, host TIDL and target outputs.', flush=True)
