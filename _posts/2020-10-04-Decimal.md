---
layout: post
title: "#010 - Increase Matlab's cursor resolution"
---

This is a simple function that enhaces the decimal accuracy of the printed values in Matlab's graphical user interface (GUI) for figures. This is extremely helpful when dealing with very large point clouds, such as elevation models or maps, where manual pixel-perfect selection is needed despite having hundreds of millions of datapoints. In this case the decimal float is espanded to 10 digits, while the printed `outText` integer will not be truncated, which is the (unhelpful) default behaviour.

```{}
function outText=DecimalGUI(obj,event)

pos=get(event,'Position');
  if length(pos)==3 % For scatter3 or plot3
    outText={sprintf('X: %.10f',pos(1)), ...
             sprintf('Y: %.10f',pos(2)), ...
             sprintf('Z: %.10f',pos(3))};
  else % For any other non-3D use
    outText={sprintf('X: %.10f',pos(1)), ...
             sprintf('Y: %.10f',pos(2))};
  end
end
```

To use this function, add the following string at the end of a new `figure` while the function code is in a separate `.m` within the same folder (working directory), or at the very end of the same `.m` script.

```{}
dcm1=datacursormode();set(dcm1,'DecimalGUI',@DecimalGUI,'Enable','on');
```
