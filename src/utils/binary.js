export function toBinary(num, bits = 16) {
  if (num >= 0) {
    return num.toString(2).padStart(bits, '0');
  } else {
    let binary = (Math.pow(2, bits) + num).toString(2);
    return binary.slice(-bits);
  }
}

