function caesarCipher(text, shift) {
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const newChar = String.fromCharCode(char.charCodeAt(0) + shift);
    result += newChar;
  }

  return result;
}

export const encryptCeaser = (text, shift) => caesarCipher(text, shift);

export const decryptCeaser = (text, shift) => caesarCipher(text, -shift);
