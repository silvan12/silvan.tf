var terminal = document.querySelector("terminal");
var keyboard = document.querySelector("keyboard");

class Command {
    constructor(name, desc, func) {
        this.name = name;
        this.desc = desc;
        this.func = func;
    }
    run(args) {
        this.func(args);
    }
}

var commands = [
    new Command("cd", "Changes the current directory.", cd),
    new Command("cls", "Clears the screen.", cls),
    new Command("help", "Provides Help information for commands.", help),
    new Command("ls", "Displays a list of files and subdirectories in the directory.", ls),
    new Command("exit", "Exits the program.", exit),
];

let i = 0;

var directory = {};
var current_directory = "";

redirect();

fetch("./data/directory.json")
    .then(response => response.json())
    .then(data => directory = data);


// on key press handle key 
document.addEventListener("keydown", (e) => {
    HandleKey(e.key);
} );


keyboard.addEventListener("click", function (event) {
    let key = event.target;
    if (key.tagName !== "KEY") {
        return;
    }
    if (key.id) {
        key = key.id === "space" ? " " : key.id;
        HandleKey(key.charAt(0).toUpperCase() + key.substring(1));
        return;
    }

    HandleKey(key.innerHTML);

});

function HandleKey(key) {
    if (!getPointer()) {
        return;
    }
    if (key === "c" && key.ctrlKey) {
        makePointer()
        return;
    }
    if (key === "Enter") {
        enter();
        return;
    }

    if (key === "Backspace") {
        backspace();
        return;
    }

    if (key.length !== 1) {
        return;
    }

    let pointer = getPointer();
    pointer.innerHTML += key;

    return;
}



function redirect() {
    // get url path without the leading slash
    let path = window.location.pathname.substring(1);

    fetch("./data/redirects.json")
        .then(response => response.json())
        .then(
            (data) => {
                if (!path) {
                    setTimeout(window.demo, 1000, "help");
                    return;
                }
                if (data[path]) {
                    window.location.href = data[path];
                    return;
                }

                setTimeout(demo, 1000, "type 404.txt");
            }
        );
}


function getPointer() {
    return document.querySelector("#active");
}

function makePointer(newlines = 2) {
    let active = getPointer();
    if (active) {
        active.innerHTML += "<br>".repeat(newlines);
        // remove class id
        active.removeAttribute("id");
    }

    let pointer = document.createElement("code");
    // add to data list
    pointer.dataset.path = `C:\\${current_directory}>`;
    pointer.classList.add('pointer');
    pointer.id = "active";

    terminal.appendChild(pointer);
}


function demo(text = "help") {
    let pointer = getPointer();

    if (i < text.length) {
        pointer.innerHTML += text.charAt(i);
        i++
        setTimeout(demo, 100, text);
        return;
    }

    i = 0;
    setTimeout(enter, 500)
}



function enter() {
    let pointer = getPointer();

    let input = pointer.innerHTML;

    pointer.innerHTML += "<br>";

    // empty input
    if (input.trim() === "") {
        makePointer(0);
        terminal.scrollTop = terminal.scrollHeight;

        return;
    }

    if (input.trim().toLowerCase() === "type 404.txt") {
        type();
        terminal.scrollTop = terminal.scrollHeight;

        return;
    }

    for (let command of commands) {
        if (input.trim().toLowerCase().startsWith(command.name)) {
            args = input.trim().substring(command.name.length).trim();
            command.run(args);
            terminal.scrollTop = terminal.scrollHeight;

            return;
        }
    }

    
    pointer.innerHTML += `'${input}' is not recognized as an internal or external command,<br>operable program or batch file.`;
    makePointer();
    
    terminal.scrollTop = terminal.scrollHeight;
}

function backspace() {
    let pointer = getPointer();
    let input = pointer.innerHTML;
    pointer.innerHTML = input.substring(0, input.length - 1);

}



function help() {
    let pointer = getPointer();
    let pre = document.createElement("pre");

    for (let command of commands) {
        // capitalize command name
        pre.innerHTML += `${command.name.toUpperCase()} &#9; ${command.desc}<br>`;
    }

    pointer.appendChild(pre);

    makePointer(1);
}

function cls() {
    terminal.innerHTML = "<br>"
    makePointer();

}

function ls() {

    let pointer = getPointer();

    // if no directory is specified, display the current directory
    let directory_array = current_directory ? directory[current_directory] : directory;

    for (let key in directory_array) {
        // if the key is an index, grab its name instead
        item = directory_array[key].name ? directory_array[key].name : key;
        pointer.innerHTML += `${item}<br>`;
    }

    makePointer(1);

}

function cd(args) {

    let directory_array = current_directory ? directory[current_directory] : directory;

    if (args.length === 0) {
        current_directory = "";
        return makePointer(0);
    }

    if (args === "/" || args === "\\" || args === "..") {
        current_directory = "";
        return makePointer(1);
    }

    for (let key in directory_array) {
        if (key === args) {
            current_directory = key;
            return makePointer(1);
        }
        if (directory_array[key].name === args) {
            window.location.href = directory_array[key].url;
            return makePointer(1);
        }
    }

    let pointer = getPointer();

    pointer.innerHTML += `'${args}' is not a valid location.`;

    makePointer();

}

function type() {
    let pre = document.createElement("pre");
    pre.innerHTML = `

         .---.    .----.      .---.   
        / .  |   /  ..  \\    / .  |   
       / /|  |  .  /  \\  .  / /|  |   
      / / |  |_ |  |  '  | / / |  |_  
     /  '-'    |'  \\  /  '/  '-'    | 
     \`----|  |-' \\  \`'  / \`----|  |-' 
          \`--'    \`---''       \`--'   


              Page not found


`;

    terminal.appendChild(pre);
    makePointer(0);
}

function exit() {
    window.close();
}