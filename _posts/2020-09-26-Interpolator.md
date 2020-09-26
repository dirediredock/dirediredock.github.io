
---
layout: post
title: "#005 - From raw data to surface lattice"
---

```{matlab}

X=Basin(:,1);Xmin=nanmin(X);Xmax=nanmax(X);
Y=Basin(:,2);Ymin=nanmin(Y);Ymax=nanmax(Y);
Z=Basin(:,3);Zmin=nanmin(Z);Zmax=nanmax(Z);

```

The following forloop creates a full grid from the `Xi` and `Yi` vectors:

```{matlab}

step=24999;
Xi=(Xmin:1/step:Xmax)';
Yi=(Ymin:0.5479999999/step:Ymax)';

string=length(Yi);
newOne=ones(string,1);

for i=1:string
    if i==1
        stanzaX=Xi(i,1);
        newX=newOne.*stanzaX;
        stanzaY=Yi;
        newY=stanzaY;
    else
        stanzaX=Xi(i,1);
        longX=newOne.*stanzaX;
        newX=cat(1,newX,longX);
        stanzaY=Yi;
        newY=cat(1,newY,stanzaY);
    end
end

```

% Creating the point cloud.

```{matlab}

xyzPoints=cat(2,X,Y,zeros(length(Z),1));
ptCloud=pointCloud(xyzPoints);

```


% Creating `newZ`, where the `K` variable determines smoothness

```{matlab}

newZ=zeros(length(newX),1);

for i=1:1:length(newX)
    
    b=mod(i,1000000);
    
    if b==0
    i
    end
    
    point=[newX(i,:),newY(i,:),0];
    
    K=2;
    
    [indices,dists]=findNearestNeighbors(ptCloud,point,K);
    
    pickZ=Z(indices);
    pointZ=nanmean(pickZ);
    newZ(i,1)=pointZ;
end

```

Exporting into vectors, and finall a 3D vector

```{matlab}

finalX=newX;
finalY=newY;
finalZ=newZ;

XYZ_Basin=cat(3,finalX,finalY,finalZ);

```








