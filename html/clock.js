setInterval(updateClock, 100);

function updateClock() {
    let t = new Date();
    clock.innerHTML = `${tt(t.getHours())}:${tt(t.getMinutes())}:${tt(t.getSeconds())}`;
}

function tt(i) {
    return i > 9 ? i : `0${i}`;
}