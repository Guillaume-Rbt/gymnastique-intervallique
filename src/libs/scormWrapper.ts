import { SCORM } from "pipwerks-scorm-api-wrapper";
import { type scormData } from "./types";

class ScormWrapper {
    #mode: "local" | "scorm" = "local";
    init: boolean = false;

    get mode(): "local" | "scorm" {
        return this.#mode;
    }

    get localData(): scormData {
        try {
            const gameData = JSON.parse(localStorage.getItem("gi_game-data") || "{}");
            return gameData;
        } catch (e) {
            console.error("Failed to retrieve local data:", e);
            return {
                "cmi.score.raw": 0,
                "cmi.suspend_data": "",
            };
        }
    }

    set localData(data: scormData) {
        try {
            localStorage.setItem("gi_game-data", JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save local data:", e);
        }
    }

    get scormData(): scormData {
        try {
            return {
                "cmi.score.raw": parseInt(SCORM.get("cmi.score.raw"), 10) || 0,
                "cmi.suspend_data": SCORM.get("cmi.suspend_data"),
            };
        } catch (e) {
            console.error("Failed to retrieve SCORM data:", e);
            return {
                "cmi.score.raw": 0,
                "cmi.suspend_data": "",
            };
        }
    }

    get data(): scormData {
        return this.#mode === "scorm" ? this.scormData : this.localData;
    }

    initialize() {
        try {
            this.init = SCORM.init();

            if (this.init) {
                this.#mode = "scorm";
                return true;
            }
        } catch (e) {
            console.error("Failed to initialize SCORM:", e);
            this.init = false;
        }

        return true;
    }

    /* Save the score to local storage or SCORM API
    This is the user's best score
    @param {number} score
    */
    saveScore(score: number) {
        if (this.mode === "scorm") {
            try {
                SCORM.set("cmi.score.raw", score.toString());
                return SCORM.save(); // SCORM API call to save score
            } catch (e) {
                console.error("Failed to save score to SCORM:", e);
                return false;
            }
        }

        try {
            this.localData = { ...this.localData, "cmi.score.raw": score };
            return true;
        } catch (e) {
            console.error("Failed to save score locally:", e);
            return false;
        }
    }

    /* Get the score from local storage or SCORM API
    This is the user's best score
    @returns {number} score or -1 if not found (not attempted), -2 on error
    */
    getScore() {
        if (this.mode === "scorm") {
            try {
                const scoreRaw = SCORM.get("cmi.score.raw");
                return scoreRaw ? parseInt(scoreRaw, 10) : -1;
            } catch (e) {
                console.error("Failed to retrieve score from SCORM:", e);
                return -2;
            }
        }
        try {
            const score = this.localData["cmi.score.raw"];
            return score ? score : -1;
        } catch (e) {
            console.error("Failed to retrieve score locally:", e);
            return -2;
        }
    }

    getLastTenScores(): number[] {
        if (this.mode === "scorm") {
            try {
                const suspendData = SCORM.get("cmi.suspend_data");
                return suspendData ? suspendData.split("@").map((score: string) => parseInt(score, 10)) : [];
            } catch (e) {
                console.error("Failed to retrieve last ten scores from SCORM:", e);
                return [];
            }
        }

        try {
            const scores = this.localData["cmi.suspend_data"] || null;
            return scores ? scores.split("@").map((score: string) => parseInt(score, 10)) : [];
        } catch (e) {
            console.error("Failed to retrieve last ten scores locally:", e);
            return [];
        }
    }

    saveNewScore(score: number) {
        const lastTenScores = this.getLastTenScores();

        if (this.mode === "scorm") {
            try {
                SCORM.set("cmi.suspend_data", [...lastTenScores.slice(-9), score].join("@"));
                return SCORM.save();
            } catch (e) {
                console.error("Failed to save new score to SCORM:", e);
                return false;
            }
        }

        try {
            this.localData = { ...this.localData, "cmi.suspend_data": [...lastTenScores.slice(-9), score].join("@") };
            return true;
        } catch (e) {
            console.error("Failed to save new score locally:", e);
            return false;
        }
    }

    terminate() {
        if (this.mode === "scorm") {
            try {
                return SCORM.quit();
            } catch (e) {
                console.error("Failed to terminate SCORM session:", e);
                return false;
            }
        }
        return true;
    }
}

export const scormWrapper = new ScormWrapper();
