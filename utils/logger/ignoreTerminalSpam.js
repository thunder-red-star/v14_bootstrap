// Ignore ExperimentalWarning and NODE_TLS_REJECT_UNAUTHORIZED
const {emitWarning} = process;

process.emitWarning = (warning, ...args) => {
	if (warning.includes('stream/web') || warning.includes('NODE_TLS_REJECT_UNAUTHORIZED')) {
		return;
	}
	return emitWarning(warning, ...args);
}