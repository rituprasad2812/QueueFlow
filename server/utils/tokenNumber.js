// Generates token numbers like A001, A002... A999, B001...
const generateTokenNumber = (currentNumber) => {
  const num = currentNumber + 1;

  // Calculate letter (A for 1-999, B for 1000-1999, etc.)
  const letterIndex = Math.floor((num - 1) / 999);
  const letter = String.fromCharCode(65 + (letterIndex % 26));

  // Calculate number within the letter group
  const numberInGroup = ((num - 1) % 999) + 1;

  // Pad to 3 digits
  const paddedNumber = String(numberInGroup).padStart(3, "0");

  return `${letter}${paddedNumber}`;
};

module.exports = generateTokenNumber;