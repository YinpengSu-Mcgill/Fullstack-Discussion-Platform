function encrypt(input, key='comp307') {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        let charCode = input.charCodeAt(i);
        let keyCode = key.charCodeAt(i % key.length);
        output += String.fromCharCode((charCode + keyCode) % 256);
    }
    return btoa(output);
}


function decrypt(input, key='comp307') {
    input = atob(input);
    let output = '';
    for (let i = 0; i < input.length; i++) {
        let charCode = input.charCodeAt(i);
        let keyCode = key.charCodeAt(i % key.length);
        output += String.fromCharCode((charCode - keyCode + 256) % 256);
    }
    return output;
}



function hash(data) {
    return CryptoJS.SHA256(data).toString();
}
