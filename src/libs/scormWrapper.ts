import { SCORM } from "pipwerks-scorm-api-wrapper";

class ScormWrapper {
    private mode: "local" | "scorm" = "local";
    init: boolean = false;

    initialize() {
        this.init = SCORM.init();

        if (this.init) {
            console.log(SCORM.get("cmi.learner_name"));
            SCORM.set("cmi.completion_status", "incomplete");
        }

        return true;
    }

    get localData(): Record<string, any> {
        try {
            const gameData = JSON.parse(localStorage.getItem("gi_game-data") || "{}");
            return gameData;
        } catch (e) {
            console.error("Failed to retrieve local data:", e);
            return {};
        }
    }

    set localData(data: Record<string, any>) {
        try {
            localStorage.setItem("gi_game-data", JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save local data:", e);
        }
    }

    /* Save the score to local storage or SCORM API
    This is the user's best score
    @param {number} score
    */
    saveScore(score: number) {
        if (this.mode === "scorm") {
            return true; // SCORM API call to save score
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
            const scoreRaw = SCORM.get("cmi.score.raw");
            return scoreRaw ? parseFloat(scoreRaw) : -1;
        }
        try {
            const score = this.localData["cmi.score.raw"];
            return score ? parseInt(score, 10) : -1;
        } catch (e) {
            console.error("Failed to retrieve score locally:", e);
            return -2;
        }
    }

    getLastTenScores(): number[] {
        if (this.mode === "scorm") {
            const suspendData = SCORM.get("cmi.suspend_data");
            return suspendData ? suspendData.split("@").map((score: string) => parseInt(score, 10)) : [];
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
            SCORM.set("cmi.suspend_data", [...lastTenScores.slice(-9), score].join("@"));
            SCORM.save();
            return true;
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
            return SCORM.quit();
        }
        return true;
    }
}

export const scormWrapper = new ScormWrapper();
