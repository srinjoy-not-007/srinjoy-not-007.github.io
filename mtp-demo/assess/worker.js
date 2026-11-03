let py,ready;
const status=(text)=>postMessage({type:'status',text});
async function init(){if(ready)return ready;ready=(async()=>{status('Loading Python runtime. The first visit downloads Python and NumPy.');importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});await py.loadPackage('numpy');const res=await fetch('runtime-bundle.json');if(!res.ok)throw Error('Planner bundle unavailable');const files=await res.json();for(const [name,text] of Object.entries(files)){const full='/project/'+name;py.FS.mkdirTree(full.slice(0,full.lastIndexOf('/')));py.FS.writeFile(full,text);}await py.runPythonAsync(`import sys,types,json
from pathlib import Path
sys.path[:0]=['/project','/project/src']
resource=types.ModuleType('resource')
resource.RUSAGE_SELF=0
resource.getrusage=lambda _:types.SimpleNamespace(ru_maxrss=0)
sys.modules['resource']=resource
from application.fleet_assessment import engine as eng
from application.fleet_assessment.findings import inspect_run
from js import postMessage
original_atomic=eng.atomic
def report_atomic(path,obj,compress=False):
    original_atomic(path,obj,compress)
    if path.name=='progress.json':postMessage(json.dumps({'type':'progress',**obj}))
eng.atomic=report_atomic
def browser_run(config_json):
    c,raw,rows,meta,source,compatible=eng.normalise(json.loads(config_json))
    job=Path('/project/browser_run');job.mkdir(exist_ok=True)
    arms=['UU','GG'] if c['planner']=='compare' else [c['planner']]
    summaries=[];traces={}
    for arm in arms:
        summary=eng.run_one(job,c,raw,rows,meta,source,compatible,arm)
        summary['peak_rss_kib']=None
        summary['runtime']='browser Python WebAssembly; timing is platform dependent'
        summaries.append(summary)
        import gzip
        traces[arm]=json.loads(gzip.decompress((job/f'{arm}_trace.json.gz').read_bytes()))
        traces[arm]['summary']=summary
    if len(summaries)==2:
        for key in ['starts_sha256','initial_goals_sha256']:
            assert summaries[0][key]==summaries[1][key]
        if c['task_mode']=='competition_rr':assert summaries[0]['latent_task_pool_sha256']==summaries[1]['latent_task_pool_sha256']
    result={'status':'complete','config':c,'map':meta,'source':source,'summaries':summaries,'arms':arms,'paired_inputs':len(arms)==2,'runtime':'browser Python WebAssembly','scope':'Exploratory application run; not a frozen research result'}
    findings=inspect_run(job,result)
    return json.dumps({'result':result,'traces':traces,'findings':findings},default=lambda x:int(x) if isinstance(x,eng.np.integer) else float(x))
`);status('Python and planner are ready.');})();return ready;}
onmessage=async e=>{try{await init();if(e.data.type==='run'){py.globals.set('request_json',JSON.stringify(e.data.config));const raw=await py.runPythonAsync('browser_run(request_json)');postMessage({type:'complete',payload:JSON.parse(raw)});}}catch(err){console.error(err);const lines=String(err.message||err).trim().split('\n');const message=(lines.findLast?.(x=>/^(ValueError|RuntimeError|AssertionError):/.test(x.trim()))||lines[lines.length-1]).replace(/^(ValueError|RuntimeError|AssertionError):\s*/,'');postMessage({type:'error',text:message});}};
