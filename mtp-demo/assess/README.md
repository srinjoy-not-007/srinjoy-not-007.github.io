# Browser fleet assessment

The public tool runs the existing Python PIBT and assessment engine through Pyodide 0.27.7 in a dedicated Web Worker. NumPy is loaded from the Pyodide distribution. Users can configure maps, counts and task streams, inspect diagnostics, export results and replay in 2D or 2.5D. Results are exploratory user runs, not additions to frozen research datasets.

The Python core comes from the project snapshot bb581f1181443b8f59d1cbb8c2b7b7ede433c220. An internal working-document reference was removed from the validator docstring. The planner logic is unchanged. The browser provides a resource-import shim solely for compatibility; Linux peak-RSS is unavailable and is reported as null. The JavaScript worker enforces wall time; Linux process resource limits do not apply to WebAssembly. Runtime and timing differ from native Python.

GG is enabled only for exact supported warehouse/open-map geometry with its published field. Custom edits require UU. Every executed step uses the existing legal-move, vertex-conflict and reverse-edge-swap validation. First-use downloads are required; failures are explicit and do not fall back to a prerecorded result. Runs remain in browser IndexedDB until deleted or exported. No custom maps or simulation records are uploaded.

Application checks: native/browser warehouse comparison (8 robots, seed 42, 2 warm-up and 6 scored steps) matched completion, wait and backward counts. A 12-robot custom open-grid run completed and persisted. Cancellation and disconnected-map rejection were checked in the browser. These are software checks, not research performance evidence.

PIBT, GGO and map provenance remain credited to the original authors on the main page. Original paper disclosures and the research history are retained.
