const Config = {
  "settings": {
    "liga": "Nitro League Division 1",
    "format": "Bo7",
    "stingerDelay": 1000,
    /*
     * For player cams, add the options to the array that should be active
     * - kickoff15 -> show cams on kickoff for 15 seconds
     * - ot -> show player cams while ot
     * - goal -> show cams when a goal was scored
     */
    "playerCams": ['kickoff', 'ot'],
    "kickoffPlayerCamTime": 15, // Time how long the player cams should be active from kickoff (will only work if playerCams above includes 'kickoff')
    "playerPicture": false,
    /* Uncomment this section to override team names and series score from ROCS
    "blue": [
      "Team Blue",
      "0"
    ],
    "orange": [
      "Team Orange",
      "0"
    ]
    */
  }
}
