import re,json,sys
T=json.load(open('/home/claude/map/text.json'))
CAST=['阿公','阿嬤','爸爸','媽媽','小姑','安安','雨晴','嘉豪','阿德伯','阿桃姨','阿凱','黃牧師','阿哲','秀琴姐','陳媽媽','王店長','李主委','子揚','阿豪']
han=lambda t:len(re.findall(r'[一-鿿]',t))
def load(path):
    out={}
    for b in re.split(r'(?m)^(?=### )',open(path,encoding='utf-8').read()):
        if not b.strip(): continue
        m=re.match(r'### (\d+):(\d+)',b); ch,v=m.groups()
        lines=b.split('\n'); head=lines[0]; rest='\n'.join(lines[1:]).lstrip('\n')
        if rest.startswith('> '): rest=rest.split('\n',1)[1].lstrip('\n')
        verse=T[ch][int(v)-1]
        b=f"{head}\n> {verse}\n\n{rest.rstrip()}\n\n"
        story=rest.split('**默想**')[0]
        plain=re.sub(r'\[\[([^\]|]+)(?:\|([^\]]+))?\]\]',lambda m:m.group(2) or m.group(1),story)
        rf=rest.split('**默想**：')[1].split('**格言**')[0].strip()
        pr=re.search(r'\*\*禱告\*\*：(.*)',rest).group(1)
        iss=[]
        n=han(plain)
        if not 280<=n<=400: iss.append(f'故事{n}')
        if not 55<=han(pr)<=115: iss.append(f'禱告{han(pr)}')
        if pr.startswith('親愛的') or '阿門' in pr or not pr.endswith('。'): iss.append('禱告格式')
        for w in ['接住','輕輕','原來','溫柔一點']:
            if w in b: iss.append('含'+w)
        for c in CAST:
            if c in pr: iss.append('禱告有'+c)
        paras=[p for p in re.split(r'\n\s*\n',rf) if p.strip()]
        if len(paras)!=3: iss.append(f'默想{len(paras)}段')
        if not 60<=han(rf)<=130: iss.append(f'默想{han(rf)}')
        bad=[k for k in re.findall(r'\[\[([^\]|]+)',story) if k not in CAST[:17]]
        if bad: iss.append('未知人物'+str(bad))
        if '子揚' in b or '阿豪' in b: iss.append('舊名')
        out[f'{ch}:{v}']=(b,iss,n)
    return out
if __name__=='__main__':
    allb={}
    for p in sys.argv[1:]:
        allb.update(load(p))
    for k,(b,iss,n) in allb.items(): print(k,n,iss)
