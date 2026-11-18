// Coordinates measured in source artwork units, from each 202 × 408 panel.
export const forgeReferenceSize = {width:202,height:408};
export const forgeMeasurements = {
  lobby:[
    ['.camp-top',0,0,202,37],
    ['.camp-rail button:first-child',6,88,36,36],
    ['.camp-actions .gold',11,325,182,65],
  ],
  map:[['.forge-map-tile:first-child',8,50,186,94]],
  heroes:[['.forge-hero-card:first-child',4,50,194,98]],
  prepare:[
    ['.starter-grid .plant-card:first-child',11,84,56,82],
    ['.forge-loadout-summary',5,270,192,70],
    ['.prepare-footer .gold',29,352,144,35],
  ],
  unlock:[['.forge-unlock',15,149,172,221]],
  battle:[
    ['.hud-topline',9,7,189,23],
    ['.hud-xp',9,29,123,10],
    ['.minimal-dock',7.5,340,187,49],
  ],
  boss:[['.encounter-bar',33,46,157,null]],
  upgrade:[['.upgrade-choice:first-child',6,101,190,67]],
  evolution:[
    ['.forge-evolution-art',9,85,184,126],
    ['.forge-evolution .gold',40,340,122,38],
  ],
  pause:[
    ['.pause-tabs',8,46,186,43],
    ['.pause-scroll',5,97,192,221],
    ['.resume-run',20,331,162,49],
  ],
  settings:[['.forge-settings-card',8,67,186,194]],
  build:[['.forge-build-loadout',4,46,194,82]],
  guide:[['.guide-grid .plant-card:first-child',7,102,59.33,78]],
  detail:[['.forge-specimen-stage',4,46,194,150]],
  shop:[['.forge-shop-row:first-child',5,59,192,46]],
  permanent:[['.forge-shop-row:first-child',5,59,192,46]],
  result:[
    ['.forge-result-title',0,0,202,78],
    ['.result-actions',5,337,192,45],
  ],
};
