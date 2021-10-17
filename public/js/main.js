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

WsSubscribers.init("localhost", 49322, false, [
    "game:update_state",
    "game:nameplate_tick",
    "cb:heartbeat",
]);

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
        $(".assister").show();
        $(".assister").text("Assist: " + d.assister.name);
    } else {
        $(".assister").hide();
    }

    if (Config.settings.playerCams) {
        $(".player-cams").show();
    } else {
        $(".player-cams").hide();
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
    $(".player-cams").show();
});

WsSubscribers.subscribe("game", "replay_end", () => {
    Overlay.showGameOverlay();
    $("#overlay-replay").hide();
    $(".player-cams").hide();
});

WsSubscribers.subscribe("game", "replay_will_end", () => {
    setTimeout(() => {
        Overlay.playStinger("stinger");
    }, Config.settings.stingerDelay * 1.5);
});

WsSubscribers.subscribe("game", "podium_start", () => {
    Overlay.hideGameOverlay();
});

WsSubscribers.subscribe("NitroLeague", "overlayload", (data) => {
    rocsState = data;
    Overlay.updateSeriesInformation(rocsState);
});

let rocsState;
WsSubscribers.subscribe("NitroLeague", "match", (data) => {
    rocsState = data;
    Overlay.updateSeriesInformation(rocsState);
});

WsSubscribers.subscribe("NitroLeague", "cams", (data) => {
    Overlay.updatePlayerCams(data);
});
