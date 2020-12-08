---
layout: post
title: "#022 - Vancouver LIDAR"
---

LiDAR (Light Detection and Ranging) data collected in 2018 of the City of Vancouver and UBC Endowment Lands with an Area of Interest (AOI) covering a total of 134 square kilometers. There are 181 files, ranging from 2.2GB to 10.5KB, with mean weight at 0.99GB, median 1.21GB, and standard deviation of 518.7MB. The total dataset is 179GB.

```{}
% Using `Digital-Forestry-Toolbox` for Lidar LAS files:

% 	00	Never Classified
% 	01	Unassigned
% 	02	Ground 
% 	03	Low Vegetation
% 	04	Medium Vegetation
% 	05	High Vegetation
% 	06	Building
% 	07	Low Noise
% 	08	Model Key / Reserved
% 	09	Water 
% 	10	Rail
% 	11	Road Surface 
% 	12	Overlap / Reserved
% 	13	Wire – Guard
% 	14	Wire – Conductor
% 	15	Transmission Tower
% 	16	Wire – Connector
% 	17	Bridge Deck
% 	18	High Noise

files=dir('*.las');
files=struct2cell(files);files=files';
filenames=files(:,1);

figure('Position',[10,10,1420,780],'Resize','off');hold on;

for i=1:length(filenames)
pc=LASread(filenames{i});
% 	noise=ismember(pc.record.classification,7);
% 	Q=pc.record.intensity(~noise);Q=double(Q);
% 	X=pc.record.x(~noise);
% 	Y=pc.record.y(~noise);
% 	Z=pc.record.z(~noise);
ground=ismember(pc.record.classification,2);
X=pc.record.x(ground);
Y=pc.record.y(ground);
Z=pc.record.z(ground);
scatter3(X(1:100:end,1),Y(1:100:end,1),Z(1:100:end,1),0.1);
drawnow;view(-45,45);
end
```

&nbsp;

![](/images/LidarA.jpg)
![](/images/LidarB.png)
![](/images/LidarC.png)
![](/images/LidarD.png)
![](/images/LidarE.png)
![](/images/LidarF.png)
![](/images/DowntownLidarA.png)
![](/images/DowntownRibbonA.png)

&nbsp;
&nbsp;
&nbsp;

