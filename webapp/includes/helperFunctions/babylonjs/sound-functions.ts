import * as BABYLON from "@babylonjs/core";

export function adjustSoundFrequencyWhileKeepingSpeed(
	sound: BABYLON.Sound,
	frequencyRatio: number
): void {
	// Get the audio source and gain node
	const audioSource = sound.getSoundSource();
	if (!audioSource) return;
	const gainNode = sound.getSoundGain();
	if (!gainNode) return;

	// Adjust the playback rate and gain
	audioSource.playbackRate.value *= frequencyRatio;
	gainNode.gain.value /= frequencyRatio;
}

export function resetSoundFrequency(sound: BABYLON.Sound): void {
	// Get the audio source and gain node
	const audioSource = sound.getSoundSource();
	if (!audioSource) return;
	const gainNode = sound.getSoundGain();
	if (!gainNode) return;

	// Restore the original playback rate and gain values
	const originalPlaybackRate = audioSource.playbackRate.defaultValue;
	const originalGain = gainNode.gain.defaultValue;

	audioSource.playbackRate.value = originalPlaybackRate;
	gainNode.gain.value = originalGain;
}
