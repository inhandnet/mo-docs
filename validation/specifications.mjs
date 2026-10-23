export function validateSpecifications(data) {
  const fail=()=>{throw Error('Invalid product specification data');};
  if(data?.schema_version!==1||data.board!=='mo-62a'||!Array.isArray(data.groups)||!data.groups.length||!/^https:\/\//.test(data.source))fail();
  const {processor:p,accelerator:a,memory:m}=data.facts||{};
  if(!p||!a||!m||!Number.isSafeInteger(p.cores)||p.cores<=0||!Number.isFinite(p.clock_ghz)||p.clock_ghz<=0||!Number.isFinite(a.tops)||a.tops<=0||!Array.isArray(m.capacities_gb)||!m.capacities_gb.length||m.capacities_gb.some(n=>!Number.isSafeInteger(n)||n<=0)||new Set(m.capacities_gb).size!==m.capacities_gb.length)fail();
  for(const value of [p.model,p.architecture,p.realtime,a.name,m.technology])if(typeof value!=='string'||!value.trim())fail();
  const labels=new Set();
  for(const group of data.groups) {
    if(typeof group.title!=='string'||!group.title||!Array.isArray(group.rows)||!group.rows.length)fail();
    for(const row of group.rows) {
      if(typeof row.label!=='string'||!row.label||labels.has(row.label))fail();labels.add(row.label);
      if(row.fact ? !['processor','accelerator','memory','image'].includes(row.fact)||row.value!==undefined : typeof row.value!=='string'||!row.value.trim())fail();
    }
  }
  return data;
}
