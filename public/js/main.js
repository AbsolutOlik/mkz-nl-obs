console.log("Initialize");

//$('#stinger').hide();
//Overlay.hideGameOverlay();
$("#postMatchStats").hide();
$("#overlay-replay").hide();
$("#targetinfo").hide();
$("#boostmeter").hide();
$(".player-cams").hide();

WsSubscribers.subscribe("ws", "open", function () {
    WsSubscribers.send("cb", "first_connect", {
        name: "Scorebug",
        version: "1",
    });
    setInterval(function () {
        WsSubscribers.send("cb", "heartbeat", "heartbeat");
    }, 1000);
});

WsSubscribers.init();

let state;

WsSubscribers.subscribe("game", "update_state", (d) => {
    state = d;

    Overlay.updateScoreboard(d);
    Overlay.updateTeamDetails(d);
    Overlay.updateClock(d.game.clock, d.game.isOT);

    if (d.game.hasTarget) {
        let target = d.game.target;
        let teamID = d.players[target];
        let player = d.teams[teamID].players[target];
        $("#targetinfo").show();
        $("#boostmeter").show();
        Overlay.updateTargetHUD(player);
    } else {
        $("#targetinfo").hide();
        $("#boostmeter").hide();
    }
});

WsSubscribers.subscribe("game", "goal_scored", (d) => {
    if (d.scorer.teamnum === 0) {
        $("#overlay-replay").addClass("replayBlue");
        $("#overlay-replay").removeClass("replayOrange");
    } else {
        $("#overlay-replay").addClass("replayOrange");
        $("#overlay-replay").removeClass("replayBlue");
    }

    $(".ballspeed").text(Math.round(d.goalspeed));
    $(".scorer").text(d.scorer.name);
    if (d.assister.name !== "") {
        $(".assister-caption").show();
        $(".assister").show();
        $(".assister").text(d.assister.name);
    } else {
        $(".assister-caption").hide();
        $(".assister").hide();
    }

    if (Config.settings.playerCams.includes('goal')) {
        $(".player-cams").show();
    }
    if (Config.settings.playerPicture) {
        try {
            const scorerPrimaryId =
                state.teams[d.scorer.teamnum].players[d.scorer.id].primaryID;

            const players = rocsState.blueTeam.players.concat(
                rocsState.orangeTeam.players
            );
            const scorerImageUrl = players.find(
                (p) => p.steam === scorerPrimaryId
            ).image;

            if (!scorerImageUrl) throw new Error("No image for that player");

            $(".player-picture").attr("src", scorerImageUrl);
            $(".player-picture").show();
            console.log(
                `Goal scored by ${d.scorer.name} (id: ${scorerPrimaryId})`
            );
        } catch {
            $(".player-picture").hide();
            console.group();
            console.error("Could not get state");
            console.error(state);
            console.groupEnd();
        }
    } else {
        $(".player-picture").hide();
    }

    setTimeout(() => {
        Overlay.playStinger("stinger");
    }, Config.settings.stingerDelay * 3);
});

WsSubscribers.subscribe("game", "replay_start", () => {
    Overlay.hideGameOverlay();
    $("#overlay-replay").show();
    if (Config.settings.playerCams.includes('goal')) $(".player-cams").show();
});

WsSubscribers.subscribe("game", "replay_end", () => {
    Overlay.showGameOverlay();
    $("#overlay-replay").hide();
    if (Config.settings.playerCams.includes('goal')) $(".player-cams").hide();
});

WsSubscribers.subscribe("game", "replay_will_end", () => {
    setTimeout(() => {
        Overlay.playStinger("stinger");
    }, Config.settings.stingerDelay * 1.5);
});

WsSubscribers.subscribe("game", "pre_countdown_begin", () => {
    if (Config.settings.playerCams.includes('kickoff')) {
        $(".player-cams").show();
        setTimeout(() => {
            if (Config.settings.playerCams.includes('ot') && state.game.isOT)
                $(".player-cams").show();
            else
                $(".player-cams").hide();
        }, 1000 * (Config.settings.kickoffPlayerCamTime || 15))
    }
})

WsSubscribers.subscribe("game", "podium_start", () => {
    Overlay.hideGameOverlay();
    $(".player-cams").hide();
});

let rocsState;
WsSubscribers.subscribe("NitroLeague", "overlayload", (data) => {
    rocsState = data;
    console.log(data);
    Overlay.updateSeriesInformation(rocsState);
    Overlay.updatePlayerCams(rocsState.playerCams);
});

WsSubscribers.subscribe("NitroLeague", "match", (data) => {
    rocsState = {...rocsState, ...data};
    Overlay.updateSeriesInformation(data);
});

WsSubscribers.subscribe("NitroLeague", "cams", (data) => {
    rocsState.playerCams = data;
    Overlay.updatePlayerCams(data);
});
