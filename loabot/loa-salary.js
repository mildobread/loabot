function _getSalary(level) {
    var sum = 0;
    var kamen = false;
    var abrel = false;
    var sangatap = false;
    var iliakhan = false;
    var kayangel = false;
    var kuku = false;
    var viakis = false;
    var valtan = false;
    var gold_count = 3;
    
    if (level >= 1630 && gold_count) { // 카멘 하드 1-4
        sum += 41000;
        kamen = true;
        gold_count--;
    }
    if (level >= 1620 && gold_count) { // 상아탑 하드 1-4
        sum += 14500;
        sangatap = true;
        gold_count--;
    }
    if (level >= 1610 && gold_count && !kamen) { // 카멘 노말 1-3
        sum += 13000;
        kamen = true;
        gold_count--;
    }
    if (level >= 1600 && gold_count) { // 일리아칸 하드 1-4
        sum += 10000;
        iliakhan = true;
        gold_count--;
    }
    if (level >= 1600 && gold_count && !sangatap) { // 상아탑 노말 1-3
        sum += 9000;
        sangatap = true;
        gold_count--;
    }
    if (level >= 1580 && gold_count) { // 카양겔 하드 1-3
        sum += 6500;
        kayangel = true;
        gold_count--;
    }
    if (level >= 1580 && gold_count && !iliakhan) { // 일리아칸 노말 1-3
        sum += 6500;
        iliakhan = true;
        gold_count--;
    }
    if (level >= 1560 && gold_count) { // 아브렐슈드 하드 1-4
        sum += 9000;
        abrel = true;
        gold_count--;
    }
    if (level >= 1550 && gold_count && !abrel) { // 아브렐슈드 하드 1-3 노말 4
        sum += 8500;
        abrel = true;
        gold_count--;
    }
    if (level >= 1540 && gold_count && !kayangel) { // 카양겔 노말 1-3
        sum += 4500;
        kayangel = true;
        gold_count--;
    }
    if (level >= 1520 && gold_count && !abrel) { // 아브렐슈드 노말 1-4
        sum += 7000;
        abrel = true;
        gold_count--;
    }
    if (level >= 1500 && gold_count && !abrel) { // 아브렐슈드 노말 1-3
        sum += 7000;
        abrel = true;
        gold_count--;
    }
    if (level >= 1475 && gold_count) { // 쿠크 노말 1-3
        sum += 3000;
        kuku = true;
        gold_count--;
    }
    if (level >= 1460 && gold_count) { // 비아 하드 1-2
        sum += 2400;
        viakis = true;
        gold_count--;
    }
    if (level >= 1445 && gold_count) { // 발탄 하드 1-2
        sum += 1800;
        valtan = true;
        gold_count--;
    }
    if (level >= 1430 && gold_count && !viakis) { // 비아 노말 1-2
        sum += 1600;
        viakis = true;
        gold_count--;
    }
    if (level >= 1415 && gold_count && !valtan) { // 발탄 노말 1-2
        sum += 1200;
        valtan = true;
        gold_count--;
    }
    return sum;
}

module.exports = {
    getSalary: _getSalary
}