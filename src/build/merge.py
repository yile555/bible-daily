import re,sys
sys.path.insert(0,'/home/claude/build'); from ingest import load
target=sys.argv[1]; N={}
for p in sys.argv[2:]:
    for k,(b,iss,n) in load(p).items():
        assert not iss,(k,iss); N[k]=b
s=open(target,encoding='utf-8').read(); out=[]
for b in re.split(r'(?m)^(?=### )',s):
    m=re.match(r'### (\d+:\d+)',b)
    out.append(N.pop(m.group(1)) if m and m.group(1) in N else b)
s=''.join(out)
if N: s=s.rstrip('\n')+'\n\n'+''.join(N.values())
open(target,'w',encoding='utf-8').write(s)
print('merged; appended',list(N))
