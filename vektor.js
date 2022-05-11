const prompt = require("prompt-sync")({ sigint: true });
const fs = require("fs");
const linear = require("./lib/gauss-jordan");

let v1;
let v2;

function saveVektor(v1, v2) {
    let cache = {
        v1: v1,
        v2: v2
    }
    fs.writeFileSync("cache.json", JSON.stringify(cache));
}

function getStützvektor(number) {
    if (prompt("Stützvektor hinzufügen (y/n): ") == "y") {
        let x = prompt("Stützvektor " + number +" (x): ");
        let y = prompt("Stützvektor " + number +" (y): ");
        let z = prompt("Stützvektor " + number +" (z): ");
        return [parseInt(x), parseInt(y), parseInt(z)];
    } else {
        return null;
    }
}

function getRichtungsvektor(number) {
    let x = prompt("Richtungsvektor " + number +" (x): ");
    let y = prompt("Richtungsvektor " + number +" (y): ");
    let z = prompt("Richtungsvektor " + number +" (z): ");
    return [parseInt(x), parseInt(y), parseInt(z)];
}

function askVektor() {
    v1 = {
        "stütz": getStützvektor(1),
        "richtung": getRichtungsvektor(1)
    }
    
    v2 = {
        "stütz": getStützvektor(2),
        "richtung": getRichtungsvektor(2)
    }

    saveVektor(v1, v2);
}

function getCache() {
    if (fs.existsSync("cache.json")) {
        let cache = JSON.parse(fs.readFileSync("cache.json"));

        if (cache.v1.richtung == null || cache.v2.richtung == null) {
            askVektor();
            console.log(v1, v2);
        } else {
            console.log(cache);
            if (prompt("Zuletzt verwendete Vektoren laden? (y/n): ") == "y") {
                v1 = cache.v1;
                v2 = cache.v2;
            } else {
                askVektor();
                console.log(v1, v2);
            }
        }
    } else {
        askVektor();
    }
}

function options() {
    console.log(" ");
    console.log("Optionen:");
    console.log("1: Skalarprodukt berechnen");
    console.log("2: Lagebeziehung berechnen");
    console.log("3: Schnittpunkt berechnen");
    console.log("4: Vektorlänge berechnen");
    console.log("5: Zwischenliegender Winkel berechnen");
    console.log("6: Vektoren ändern");
    console.log("7: Komplettanalyse");
    console.log(" ");
    let option = prompt("Wählen Sie eine Option (1-7): ");
    console.log(" ");
    if (option == "1") skalarprodukt(v1.richtung, v2.richtung);
    else if (option == "2") {
        lagebeziehungConsole(v1, v2);
    }
    else if (option == "3") {
        schnittpunkt(v1, v2);
    }
    else if (option == "4") {
        console.log("Länge der beiden Vektoren (v1, v2): " + länge(v1, v2));
    }
    else if (option == "5") {
        console.log("Zwischenliegender Winkel: " + winkel(v1, v2) + "°");
    }
    else if (option == "6") {
        askVektor();
        options();
    }
    else if (option == "7") {
        skalarprodukt(v1.richtung, v2.richtung);
        lagebeziehungConsole(v1, v2);
        schnittpunkt(v1, v2);
        console.log("Zwischenliegender Winkel: " + winkel(v1, v2) + "°");
        console.log("Länge der beiden Vektoren (v1, v2): " + länge(v1, v2));
    }
}

function winkel(v1, v2) {
    let a = v1.richtung[0] * v2.richtung[0];
    let b = v1.richtung[1] * v2.richtung[1];
    let c = v1.richtung[2] * v2.richtung[2];
    let d = a + b + c;

    let winkel = parseFloat(Math.acos(d / (länge(v1, v2)[0] * länge(v1, v2)[1])) / (2 * Math.PI / 360)).toFixed(2);

    return winkel;
}

function länge(v1, v2) {
    let a = parseFloat(Math.sqrt(v1.richtung[0] ** 2 + v1.richtung[1] ** 2 + v1.richtung[2] ** 2).toFixed(2));
    let b = parseFloat(Math.sqrt(v2.richtung[0] ** 2 + v2.richtung[1] ** 2 + v2.richtung[2] ** 2).toFixed(2));
    return [a, b];
}

function schnittpunkt(v1, v2) {
    let lg = lagebeziehung(v1, v2)[0];

    let r = lg[0];
    let s = lg[1];

    if (typeof(lg) == "object") {
        let a = v1.stütz[0] + r * v1.richtung[0];
        let b = v1.stütz[1] + r * v1.richtung[1];
        let c = v1.stütz[2] + r * v1.richtung[2];
        console.log("Schnittpunkt: [" + a + ", " + b + ", " + c + "]");
        return [a, b, c];
    } else {
        console.log("Schnittpunkt: NaN");
    }

}

function richtung(v1, v2) {
    let a = v2.richtung[0] / v1.richtung[0];
    let b = v2.richtung[1] / v1.richtung[1];
    let c = v2.richtung[2] / v1.richtung[2];

    if (a == b && b == c) {
        return true;
    } else return false;
}

function wos(v1, v2) {

    let a = [v1.richtung[1], -v2.richtung[1]];
    let b = [v1.richtung[2], -v2.richtung[2]];

    let matrix = [a, b];

    let solutions = [(v2.stütz[1] - v1.stütz[1]), (v2.stütz[2] - v1.stütz[2])];

    let result = linear.solve(matrix, solutions);
    
    let c1 = v1.stütz[0] + (result[0] * (v1.richtung[0]));
    let cc1 = v2.stütz[0] + (result[1] * (v2.richtung[0]));

    let c2 = v1.stütz[1] + (result[0] * (v1.richtung[1]));
    let cc2 = v2.stütz[1] + (result[1] * (v2.richtung[1]));

    let c3 = v1.stütz[2] + (result[0] * (v1.richtung[2]));
    let cc3 = v2.stütz[2] + (result[1] * (v2.richtung[2]));
    
    if (c1 == cc1 && c2 == cc2 && c3 == cc3) {
        //console.log("Lagebeziehung: Ungleiche Richtung & Schneidend");
        return [result];
    } else {
        return [false, "Ungleiche Richtung & Windschief"];
    }

}

function identisch(v1, v2) {

    let a = (v2.stütz[0] - v1.stütz[0]) / v1.richtung[0];
    let b = (v2.stütz[1] - v1.stütz[1]) / v1.richtung[1];
    let c = (v2.stütz[2] - v1.stütz[2]) / v1.richtung[2];

    if (a == b && b == c) {
        return [true, "Gleiche Richtung & Identisch"];
    } else {
        return [false, "Gleiche Richtung & Parallel"];
    }

} 

function skalarprodukt(v1, v2) {
    let result = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    if (result == 0) console.log("Skalarprodukt: " + result + " (Orthogonal)");
    else console.log("Skalarprodukt: " + result + " (nicht Orthogonal)");
}

function lagebeziehung(v1, v2) {

    if (v1.richtung == undefined || v2.richtung == undefined) {
        console.log("Für die Lagebeziehung werden Richtungsvektoren benötigt.");
        askVektor();
        lagebeziehung(v1, v2);
    } else {
        let r = richtung(v1, v2);

        if (r) {
            return identisch(v1, v2);
        } else {
            return wos(v1, v2);
        }
    }

}

function lagebeziehungConsole(v1, v2) {
    let a = lagebeziehung(v1, v2);
        if (a[0] == true || a[0] == false) {
            console.log("Lagebeziehung: " + a[1]);
        } else {
            console.log("Lagebeziehung: Ungleiche Richtung & Schneidend");
        }
}

getCache();
options();