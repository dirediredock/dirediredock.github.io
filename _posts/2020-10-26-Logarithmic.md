---
layout: post
title: "#016 - Logarithmic waterfront"
---

Highly skewed distributions are those that have values clustered at one end of their range. Direct visualization using a colormap doesn’t work, because only a fraction of the total color spectrum will be used by the data. Two things can fix this, either the colormap is transformed to match the distribution, or the distribution is transformed so that clustering is reduced.

Transforming colormaps is not a good idea, because they are purposefully built with human vision in mind. Perceptually uniform colormaps such as `viridis`, `inferno`, `magma`, and `plasma` are loaded from a pre-set and vectors, tailor-made to be color-blindness and luminosity proof. Transforming these colormaps will distort them.

Transforming data is a routine pre-processing technique, usually through logarithm or square root. Logarithmic transform is useful for continuous data, especially clustered around zero. The logarithmic scale becomes vertically asymptotic towards negative infinity at zero, but in the vicinity of zero the resolution of numbers increases dramatically. However, if the data has actual zeroes this transform will not work, to fix this a constant must be added to “slide” the data across the horizontal axis.

In this case we are interested in the hidden patterns around the tidal margin of downtown Vancouver, the most urbanized region of Burrard Inlet. Here data is truncated, anything below `0` meters (including `0`) and anything above `15` meters (including `15`) is discarded. What remains is transformed but avoiding the intense scaling of near-zero logarithms, so a constant of `100000` is added. This results in a largely uniform colormap application that enhances subtle shoreline details.

&nbsp;

![](/images/LogMapFull.png)

&nbsp;

The figure above uses the `inferno` perceptual colormap and is exported in CMYK colorspace at 600 dpi. Three shorelines are overlaid in white, the 2020 low tide mark at zero meters, the 2020 high water mark, and the buried shorelines from old maps dating between 1880 and 1890. The code below renders truncates and transforms the elevation data and then renders the figure above.

```{}
load ENC2020_Polygon
load HighTide2020_lakes
load XYZ_DepthZeroJitter 
load geoXY_Oldest
load geoXY_1890North
load ElevationModelX
load ElevationModelY
load ElevationModelZ
 
ElevationModelX(ElevationModelX<-123.175)=NaN;
ElevationModelX(ElevationModelX>-122.975)=NaN;
ElevationModelY(ElevationModelY<49.2625)=NaN;
ElevationModelY(ElevationModelY>49.3375)=NaN;
ElevationModelZ(ElevationModelZ<=0)=NaN;
ElevationModelZ(ElevationModelZ>=15)=NaN;
ElevModel=cat(2,ElevationModelX,ElevationModelY,ElevationModelZ);
ElevModel(any(isnan(ElevModel),2),:)=[];
LogZ=log(ElevModel(:,3)+100000);
 
figure('Position',[10,10,1420,780],'Resize','off','Color','k');hold on;
scatter(ElevModel(:,1),ElevModel(:,2),0.01,LogZ,'*');
A=XYZ_DepthZeroJitter;plot(A(:,1),A(:,2),'-w','LineWidth',0.4);
A=HighTide2020_lakes;plot(A(:,1),A(:,2),'-w','LineWidth',0.4);
A=ENC2020_Polygon;plot(A(:,1),A(:,2),'-w','LineWidth',0.4);
A=North1890;plot(A(:,1),A(:,2),'-w','LineWidth',0.4);
A=geoXY_Oldest;scatter(A(:,1),A(:,2),0.01,'w');
xlim([-123.175,-122.975]);ylim([49.2625,49.3375]);
colormap(flipud(inferno));axis off;drawnow;
```

There are three regions that just before 1880 were shallow enough to be drowned at high tide, marked `A`, `B`, and `C` in the figure below. The logarithmic colormap reveals the shallowest points between water bodies, with bright yellow closest to sea level.

At `A` a lost connection made Stanley Park into an island. A causeway would drain the high tide of Lost Lagoon into Second Beach through the meander at `A`, which is now infilled. Sites `B` and `C` made Downtown Vancouver into an island, perhaps two islands, for a total of three counting Stanley Park. At `B` the high tide of False Creek Flats (fully infilled in the 1920s) would connect with Inner Harbour. Site `C` is a lost creek relevead with the logarithmic colormap, meaning it has survived until 2020. The elevation data of sites `A` and `C` support couseways existed that are now infilled.

In contrast, site `B` is unclear. There is a narrowing of the pre-contact shoreline, alongside shallower land, but there is no obvious trail or causeway revealed. This is likely because any connection is now buried under too many layers of infill, as that is also the site of the oldest urban settlements in Vancouver, with railway tracks still in use today.

&nbsp;

![](/images/LogMapSites.png)

&nbsp;

Many thanks for the council of Michelle George and Mike George for sharing Tsleil-Waututh knowledge about the pre-contact state of Burrard Inlet, including the location of three sites in the figure above.

&nbsp;
&nbsp;
&nbsp;
