# POSSIBLE OPTIONS

```javascript
const possibleOptions = {
    degree, //DEGREES TO SET AT INITIALIZE - ELSE 0
    location, // FROM 0 TO 4 => NONE: 0, TOP_LEFT: 1, TOP_RIGHT: 2, BOTTOM_RIGHT: 3, BOTTOM_LEFT: 4
    xOffset, // CUSTOM OFFSET X
    yOffset, // CUSTOM OFFSET Y
    theme, // UNTIL NOW ONLY DARK AVAILABLE
    size, //SIZE OF CONTROLIN PX => DEFAULT IS 200px
    fontSize, //FONTSIZE => DEFAULT IS 2.5vw
    stayInsideImage, //LET CONTROL STAY IN VIEWER OR NOT
    positioning //ADDITIONAL POSITIONING => {direction: [to-the-left, to-the-right, above, below], element: [DOMElement]}
}
```


# USAGE 
Only pass the viewer and your own options into the control :)

```javascript
new OpenSeadragon.RotationDetails({
  viewer
})
```

# THANKS TO
Thanks to the National Institute of Standards and Technology ([a link](https://github.com/usnistgov/OpenSeadragonScalebar)) for their work which helped me a lot for my own control!
