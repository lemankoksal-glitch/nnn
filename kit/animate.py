import numpy as np, cv2, sys, os
from PIL import Image, ImageDraw, ImageFont
SRC='/mnt/user-data/uploads/Downloads/ne_oai_%s.png'; OUT='/home/claude/night-edit/oai/'
W,H=960,640; N=12; K=W/1200  # coords authored in 1200x800 space
TAU=2*np.pi
def bob(cx,cy,rx,ry,amp,ph=0,axis='y',core=.55): return ('bob',cx,cy,rx,ry,amp,ph,axis,core)
def rot(cx,cy,r,deg,mode='osc',ph=0): return ('rot',cx,cy,r,deg,mode,ph)
def drift(cx,cy,rx,ry,dx,dy): return ('drift',cx,cy,rx,ry,dx,dy)
SCENES={
 'hero':[bob(197,410,150,400,10,0),rot(197,105,95,6),bob(960,410,170,400,10,np.pi),bob(1125,210,60,60,8,1.0),
         bob(456,270,34,34,10,0),bob(524,310,34,34,10,.8),bob(590,344,34,34,10,1.6),bob(660,360,34,34,10,2.4),bob(730,374,34,34,10,3.2)],
 'runway':[bob(211,330,150,330,16,0),bob(609,330,150,330,16,2.1),bob(984,330,150,330,16,4.2)],
 'thread':[rot(530,492,100,360,'spin'),bob(190,230,130,120,10,0,'x'),bob(560,90,110,90,10,0),bob(1000,190,200,140,12,1),
           bob(880,540,40,60,6,0),bob(960,540,40,60,6,.8),bob(1040,540,40,60,6,1.6),bob(1110,540,40,60,6,2.4),bob(90,560,80,200,6,1)],
 'ai':[bob(170,430,160,380,8,0),bob(609,281,160,160,12,1),bob(940,450,130,280,6,2,'x'),bob(300,460,90,90,8,.5,'x')],
 'palette':[bob(155,400,100,340,12,0),bob(366,400,100,340,12,1.2),bob(586,400,100,340,12,2.4),bob(820,400,100,340,12,3.6),bob(1040,400,100,340,12,4.8),bob(586,80,40,40,10,0)],
 'fabric':[bob(164,410,130,360,10,0,'x'),bob(445,410,130,360,10,1.5,'x'),bob(750,410,130,360,10,3,'x'),bob(1040,410,130,360,10,4.5,'x')],
 'wanted':[bob(445,300,110,90,12,0),bob(726,360,90,150,10,1.4),bob(1022,281,120,80,12,2.8),bob(225,178,40,40,10,0),bob(160,420,120,160,8,1,'x')],
 'moon':[bob(562,400,340,340,10,0),drift(726,300,90,90,0,-30),bob(211,127,45,45,14,0),bob(94,431,45,45,14,1.2),bob(1031,352,45,45,14,2.4),bob(937,117,45,45,14,3.6),bob(1008,623,45,45,14,4.8)],
}
def weight(X,Y,cx,cy,rx,ry,core):
    d=np.sqrt(((X-cx)/rx)**2+((Y-cy)/ry)**2); w=np.clip((1-d)/(1-core),0,1); return w*w*(3-2*w)
def frame(img,regs,t):
    Y,X=np.mgrid[0:H,0:W].astype(np.float32); mx=X.copy(); my=Y.copy()
    for r in regs:
        if r[0]=='bob':
            _,cx,cy,rx,ry,amp,ph,axis,core=r; cx,cy,rx,ry,amp=cx*K,cy*K,rx*K,ry*K,amp*K
            w=weight(X,Y,cx,cy,rx,ry,core); s=amp*np.sin(TAU*t+ph)
            if axis=='y': my-=w*s
            else: mx-=w*s
        elif r[0]=='drift':
            _,cx,cy,rx,ry,dx,dy=r; cx,cy,rx,ry=cx*K,cy*K,rx*K,ry*K
            w=weight(X,Y,cx,cy,rx,ry,.4); u=np.sin(np.pi*t)  # ease out and back
            mx-=w*dx*K*u; my-=w*dy*K*u
        else:
            _,cx,cy,rr,deg,mode,ph=r; cx,cy,rr=cx*K,cy*K,rr*K
            a=np.deg2rad(deg*t if mode=='spin' else deg*np.sin(TAU*t+ph))
            d=np.sqrt((X-cx)**2+(Y-cy)**2); w=(d<rr).astype(np.float32) if mode=='spin' else np.clip((rr-d)/(rr*.25),0,1)
            c,s=np.cos(-a),np.sin(-a); sx=cx+c*(X-cx)-s*(Y-cy); sy=cy+s*(X-cx)+c*(Y-cy)
            mx=mx*(1-w)+sx*w; my=my*(1-w)+sy*w
    return cv2.remap(img,mx.astype(np.float32),my.astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT)
def title(im):
    F=os.path.join(os.path.dirname(os.path.abspath(__file__)),'fonts','HankenGrotesk[wght].ttf')
    big=ImageFont.truetype(F,int(78*K)); big.set_variation_by_axes([800]); sm=ImageFont.truetype(F,int(21*K)); sm.set_variation_by_axes([700])
    d=ImageDraw.Draw(im); ink=(18,18,18)
    for i,l in enumerate(['THE NIGHT','EDIT']): d.text((600*K,(34+i*74)*K),l,font=big,fill=ink,anchor='ma')
    d.text((600*K,200*K),'FASHION · MATERIALS · AI',font=sm,fill=ink,anchor='ma')
    return im
names=sys.argv[1:] or list(SCENES)
for n in names:
    img=cv2.resize(cv2.imread(SRC%n),(W,H),interpolation=cv2.INTER_AREA)
    fr=[Image.fromarray(cv2.cvtColor(frame(img,SCENES[n],i/N),cv2.COLOR_BGR2RGB)) for i in range(N)]
    if n=='hero': fr=[title(f) for f in fr]
    m=Image.new('RGB',(W,H*3))
    for k,f in enumerate([fr[0],fr[4],fr[8]]): m.paste(f,(0,k*H))
    pal=m.quantize(colors=96,method=Image.MEDIANCUT)
    q=[f.quantize(palette=pal,dither=Image.NONE) for f in fr]
    q[0].save(OUT+n+'.gif',save_all=True,append_images=q[1:],duration=120,loop=0,optimize=True,disposal=1)
    print(n,os.path.getsize(OUT+n+'.gif'))
