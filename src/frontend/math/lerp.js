/**
 * @param {number} value1
 * @param {number} value2
 * @param {number} amount
 */
export default (value1, value2, amount) => {
	return (1 - amount) * value1 + amount * value2;
}