"""Convert a small OSM XML export into an attributed offline pilot snapshot.
Usage: python3 scripts/import-osm.py public/geodata/lagos-victoria-island.osm
Roads are clipped; building outlines are retained only when wholly inside bounds.
No POI names are treated as partners, and no heights are invented as source facts.
"""
from pathlib import Path
import sys,json,argparse,xml.etree.ElementTree as ET
from datetime import datetime,timezone
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('input',type=Path)
parser.add_argument('--bbox',default='3.419,6.430,3.425,6.435',help='west,south,east,north')
parser.add_argument('--origin',default='6.4325,3.422',help='latitude,longitude')
parser.add_argument('--id',default='ng-lagos-victoria-island-pilot')
parser.add_argument('--scale',type=float,default=.25)
parser.add_argument('--output',type=Path,default=root/'src/domains/geography/data/lagos-victoria-island.json')
args=parser.parse_args()
west,south,east,north=map(float,args.bbox.split(','));latitude,longitude=map(float,args.origin.split(','))
if not (west<east and south<north and east-west<=.05 and north-south<=.05 and args.scale>0):parser.error('Invalid or oversized pilot bounds/scale')
bounds={'west':west,'south':south,'east':east,'north':north}
xml=ET.parse(args.input).getroot();nodes={n.attrib['id']:{'longitude':float(n.attrib['lon']),'latitude':float(n.attrib['lat']),'id':'osm/node/'+n.attrib['id']} for n in xml.findall('node')}
def inside(p):return bounds['west']<=p['longitude']<=bounds['east'] and bounds['south']<=p['latitude']<=bounds['north']
def clip(a,b):
 x,y=a['longitude'],a['latitude'];dx,dy=b['longitude']-x,b['latitude']-y;lo,hi=0.,1.
 for p,q in [(-dx,x-bounds['west']),(dx,bounds['east']-x),(-dy,y-bounds['south']),(dy,bounds['north']-y)]:
  if abs(p)<1e-14:
   if q<0:return None
  else:
   t=q/p
   if p<0:lo=max(lo,t)
   else:hi=min(hi,t)
   if lo>hi:return None
 def point(t,original):
  if t==0:return a
  if t==1:return b
  lon,lat=round(x+dx*t,10),round(y+dy*t,10)
  return {'id':f'clip/{original["id"]}/{lon}/{lat}','longitude':lon,'latitude':lat}
 return [point(lo,a),point(hi,b)] if hi-lo>1e-10 else None
roads=[];buildings=[];excluded=0
for way in xml.findall('way'):
 tags={t.attrib['k']:t.attrib['v'] for t in way.findall('tag')};refs=[n.attrib['ref']for n in way.findall('nd')]
 if any(n not in nodes for n in refs):continue
 coords=[nodes[n] for n in refs];ident='osm/way/'+way.attrib['id']
 if 'highway'in tags:
  allowed=tags['highway'] in ['primary','secondary','tertiary','residential','unclassified','service','pedestrian','footway','path','living_street'] and tags.get('access') not in ['private','no'] and tags.get('foot')!='no'
  if not allowed:excluded+=1;continue
  segments=[c for a,b in zip(coords,coords[1:]) if (c:=clip(a,b))]
  if segments:roads.append({'id':ident,'version':int(way.attrib.get('version',0)),'name':tags.get('name'),'kind':tags['highway'],'layer':tags.get('layer','0'),'bridge':tags.get('bridge','no'),'tunnel':tags.get('tunnel','no'),'segments':segments})
 if 'building'in tags and tags['building']!='no' and len(coords)>=4 and refs[0]==refs[-1] and all(inside(p)for p in coords):
  buildings.append({'id':ident,'version':int(way.attrib.get('version',0)),'outline':coords[:-1],'height':tags.get('height'),'levels':tags.get('building:levels')})
data={'schemaVersion':1,'id':args.id,'bounds':bounds,'origin':{'latitude':latitude,'longitude':longitude},'worldUnitsPerMetre':args.scale,'source':{'name':'OpenStreetMap','url':'https://api.openstreetmap.org/api/0.6/map?bbox='+args.bbox,'attribution':'© OpenStreetMap contributors','licence':'ODbL-1.0','licenceUrl':'https://www.openstreetmap.org/copyright','retrievedAt':datetime.now(timezone.utc).isoformat(),'rawFile':'geodata/'+args.input.name},'roads':roads,'buildings':buildings,'excludedRoadWays':excluded}
output=args.output;output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps(data,separators=(',',':'))+'\n');print(len(roads),'road ways',sum(len(r['segments'])for r in roads),'segments',len(buildings),'building footprints')
