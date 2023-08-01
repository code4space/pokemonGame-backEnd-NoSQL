export default function drawPokemon(ballType: "masterball" | "pokeball" | "greatball" | 'ultraball', baseExp: number) {
    const randomNum = Math.random() * 100;
    if (ballType === "masterball") return true;
    if (baseExp < 44) {
        if (ballType === "pokeball") {
            if (randomNum <= 80) return true;
            else return false;
        } else {
            return true;
        }
    } else if (baseExp < 88) {
        if (ballType === "pokeball") {
            if (randomNum <= 70) return true;
            else return false;
        } else {
            return true;
        }
    } else if (baseExp < 132) {
        if (ballType === "pokeball") {
            if (randomNum <= 50) return true;
            else false;
        } else if (ballType === "greatball") {
            if (randomNum <= 75) return true;
            else return false;
        } else {
            return true;
        }
    } else if (baseExp < 176) {
        if (ballType === "pokeball") {
            if (randomNum <= 40) return true;
            else return false;
        } else if (ballType === "greatball") {
            if (randomNum <= 60) return true;
            else return false;
        } else {
            if (randomNum <= 80) return true;
            else return false;
        }
    } else if (baseExp < 220) {
        if (ballType === "pokeball") {
            if (randomNum <= 30) return true;
            else return false;
        } else if (ballType === "greatball") {
            if (randomNum <= 45) return true;
            else return false;
        } else {
            if (randomNum <= 60) return true;
            else return false;
        }
    } else if (baseExp < 264) {
        if (ballType === "pokeball") {
            if (randomNum <= 20) return true;
            else return false;
        } else if (ballType === "greatball") {
            if (randomNum <= 30) return true;
            else return false;
        } else {
            if (randomNum <= 40) return true;
            else return false;
        }
    } else if (baseExp < 308) {
        if (ballType === "pokeball") {
            if (randomNum <= 12) return true;
            else return false;
        } else if (ballType === "greatball") {
            if (randomNum <= 18) return true;
            else return false;
        } else {
            if (randomNum <= 24) return true;
            else return false;
        }
    } else {
        if (ballType === "pokeball") {
            if (randomNum <= 8) return true;
            else return false;
        } else if (ballType === "greatball") {
            if (randomNum <= 12) return true;
            else return false;
        } else {
            if (randomNum <= 16) return true;
            else return false;
        }
    }
}