
enum UserInput {
    Left,
    Right,
    Up,
    Down,

    ShiftLeft,
    ShiftRight,
    ShiftUp,
    ShiftDown,

    Increase,
    Decrease,

    Float,
    SetMaster,
}

class Rect {
    public static zero(): Rect {
        return new Rect(0, 0, 0, 0);
    }

    public height: number;
    public width: number;
    public x: number;
    public y: number;

    constructor(x, y, w, h) {
        this.height = h;
        this.width = w;
        this.x = x;
        this.y = y;
    }

    public copyTo(other: Rect) {
        other.height = this.height;
        other.width = this.width;
        other.x = this.x;
        other.y = this.y;
    }
}
