"""Cuts a Gemini icon sheet (5x5 grid, magenta background) into 16x16 icons in src/render/icon-art.ts.
Run: python3 -I scripts/gemini-icons.py 16 sheet.jpg   (needs Pillow and numpy; writes sheet16.png in the cwd)
Then run it with gen mode: python3 -I scripts/gemini-icons.py gen
"""
import sys
if len(sys.argv)>1 and sys.argv[1]=='gen':
    import numpy as np
    from PIL import Image
    a=np.array(Image.open('sheet16.png'))
    PAL={(0x0b,0x0b,0x0c):'d',(0xf4,0xf4,0xf5):'e',(0xa1,0xa1,0xaa):'f',(0xe8,0xb0,0x4a):'h',(0xe5,0x48,0x4d):'j',(0xf0,0x8a,0x24):'m'}
    names=['coin','heart','key','flame','person','house','pair','chat','scroll','book','log','stats','howto','gear','install']
    out=["// Icons drawn by Gemini, then cut, snapped to 16x16 and recoloured to six inks by scripts/. Do not hand-edit.",
    "// d ink, e white, f grey, h mustard, j red, m orange (keys live in PALETTE in sprites.ts).",
    "export const ICON_ART: Record<string, string[]> = {"]
    for i,n in enumerate(names):
        r,c=divmod(i,5); cell=a[r*16:(r+1)*16,c*16:(c+1)*16]
        rows=[''.join('.' if p[3]<128 else PAL[tuple(p[:3])] for p in row) for row in cell]
        out.append(f"  {n}: [\n"+''.join(f"    '{x}',\n" for x in rows)+"  ],")
    out.append("};\n")
    open('/home/user/lurahsimulator/src/render/icon-art.ts','w').write('\n'.join(out))
    sys.exit()
import sys, numpy as np
from PIL import Image
src=sys.argv[2]
im=Image.open(src).convert('RGB'); W=im.size[0]; c=W/5
names=['coin','heart','key','flame','person','house','people','chat','scroll','book','log','stats','howto','gear','install',
 'coin2','heart2','key2','flame2','person2','house2','people2','chat2','scroll2','book2']
PAL=[(0x0b,0x0b,0x0c),(0xf4,0xf4,0xf5),(0xa1,0xa1,0xaa),(0xe8,0xb0,0x4a),(0xe5,0x48,0x4d),(0xf0,0x8a,0x24)]
N=int(sys.argv[1]) if len(sys.argv)>1 else 16
out=Image.new('RGBA',(N*5,N*5),(0,0,0,0))
for i,n in enumerate(names):
    r,col=divmod(i,5)
    cell=np.array(im.crop((int(col*c)+6,int(r*c)+6,int((col+1)*c)-6,int((r+1)*c)-6))).astype(int)
    R,G,B=cell[...,0],cell[...,1],cell[...,2]
    bg=(R>150)&(B>120)&(G<130)&(R-G>90)&(B-G>60)
    ys,xs=np.where(~bg); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    rgba=np.dstack([cell,(~bg)*255]).astype(np.uint8)[y0:y1,x0:x1]
    t=Image.fromarray(rgba,'RGBA'); s=(N-2)/max(t.size); 
    t=t.resize((max(1,round(t.size[0]*s)),max(1,round(t.size[1]*s))),Image.BOX)
    a=np.array(t); 
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            if a[y,x,3]<128: a[y,x]=0; continue
            p=min(PAL,key=lambda q:sum((q[k]-int(a[y,x,k]))**2 for k in range(3)))
            a[y,x]=(*p,255)
    t=Image.fromarray(a,'RGBA'); out.alpha_composite(t,(col*N+(N-t.size[0])//2,r*N+(N-t.size[1])//2))
out.save(f'sheet{N}.png')
import subprocess
bg=Image.new('RGBA',out.size,(24,24,27,255)); bg.alpha_composite(out)
bg.resize((out.size[0]*8,out.size[1]*8),Image.NEAREST).save(f'prev{N}.png')
