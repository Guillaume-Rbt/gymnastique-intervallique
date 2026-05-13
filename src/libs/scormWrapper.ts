import { SCORM } from "pipwerks-scorm-api-wrapper";
import { type scormData } from "./types";
import UUID from "./uuid";

const MODE = import.meta.env.MODE; // "development" in dev mode, "production" in build

const fakeData = {
    "cmi.score.raw": Math.floor(Math.random() * 51),
    "cmi.suspend_data": '{"id":"1", "score": 2, "date": 1000}', // Example of last 10 scores
};

export type ScoreType = {
    id: string;
    score: number;
    date: number;
};

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
        if (MODE == "development") {
            return fakeData;
        }
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

    getLastTenScores(useFake = false): ScoreType[] {
        if (useFake) {
            return fakeData["cmi.suspend_data"]
                .split("@")
                .filter(Boolean)
                .map((score) => JSON.parse(score) as ScoreType);
        }
        try {
            const suspendData =
                this.mode === "scorm" ? SCORM.get("cmi.suspend_data") : this.localData["cmi.suspend_data"];

            if (!suspendData) return [];

            return suspendData
                .split("@")
                .filter(Boolean)
                .map((score) => JSON.parse(score) as ScoreType);
        } catch (e) {
            console.error("Failed to retrieve last ten scores:", e);
            return [];
        }
    }
    saveNewScore(score: number) {
        const lastTenScores = this.getLastTenScores();

        const newScore: ScoreType = {
            id: UUID.generate(),
            score,
            date: Date.now(),
        };

        const suspendData = [newScore, ...lastTenScores.slice(0, 9)].map((score) => JSON.stringify(score)).join("@");

        if (this.mode === "scorm") {
            try {
                SCORM.set("cmi.suspend_data", suspendData);
                return SCORM.save();
            } catch (e) {
                console.error("Failed to save new score to SCORM:", e);
                return false;
            }
        }

        try {
            this.localData = {
                ...this.localData,
                "cmi.suspend_data": suspendData,
            };
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
