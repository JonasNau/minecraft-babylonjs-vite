import * as BABYLON from "@babylonjs/core";

export default class PlayerBody {
	wholeBody: BABYLON.Mesh;
	head: BABYLON.Mesh;
	body: BABYLON.Mesh;
	legs: {
		left: BABYLON.Mesh;
		right: BABYLON.Mesh;
	};
	arms: {
		left: BABYLON.Mesh;
		right: BABYLON.Mesh;
	};

	constructor(scene: BABYLON.Scene) {
		const HEAD_OPTIONS = {
			width: 0.25,
			height: 0.25,
			depth: 0.25,
		};

		// Create body parts
		this.head = BABYLON.MeshBuilder.CreateBox(
			"player-head",
			HEAD_OPTIONS,
			scene
		);

		const BODY_OPTIONS = {
			width: 0.4,
			height: 0.75,
			depth: 0.3,
		};

		this.body = BABYLON.MeshBuilder.CreateBox(
			"player-body",
			BODY_OPTIONS,
			scene
		);

		const LEG_OPTIONS = {
			width: 0.1,
			height: 0.6,
			depth: 0.2,
		};

		this.legs = {
			left: BABYLON.MeshBuilder.CreateBox(
				"player-leg-left",
				LEG_OPTIONS,
				scene
			),
			right: BABYLON.MeshBuilder.CreateBox(
				"player-leg-right",
				LEG_OPTIONS,
				scene
			),
		};

		const ARM_OPTIONS = {
			width: 0.1,
			height: 0.6,
			depth: 0.1,
		};

		this.arms = {
			left: BABYLON.MeshBuilder.CreateBox(
				"player-arm-left",
				ARM_OPTIONS,
				scene
			),
			right: BABYLON.MeshBuilder.CreateBox(
				"player-arm-right",
				ARM_OPTIONS,
				scene
			),
		};

		//Place Leg right
		this.legs.right.position.y = LEG_OPTIONS.height / 2; // Position legs so that they are on the ground (the axis is exactly in the middle)
		this.legs.right.position.x = BODY_OPTIONS.width / 4; // Make space for two legs

		//Place Leg left
		this.legs.left.position.y = LEG_OPTIONS.height / 2; // Position legs so that they are on the ground (the axis is exactly in the middle)
		this.legs.left.position.x = -(BODY_OPTIONS.width / 4); // Make space for two legs

		//Place Body
		this.body.position.y = BODY_OPTIONS.height / 2 + LEG_OPTIONS.height;

		//Place Arm right
		this.arms.right.position.y =
			LEG_OPTIONS.height + BODY_OPTIONS.height - ARM_OPTIONS.height / 2;
		this.arms.right.position.x = BODY_OPTIONS.width / 2 + ARM_OPTIONS.width / 2;

		//Place Arm left
		this.arms.left.position.y =
			LEG_OPTIONS.height + BODY_OPTIONS.height - ARM_OPTIONS.height / 2;
		this.arms.left.position.x = -(
			BODY_OPTIONS.width / 2 +
			ARM_OPTIONS.width / 2
		);

		// Set positions of body parts relative to each other
		this.head.position.y =
			HEAD_OPTIONS.height / 2 + BODY_OPTIONS.height + LEG_OPTIONS.height;

		// Create a whole body mesh to be the parent
		this.wholeBody = new BABYLON.Mesh("whole-body", scene);

		// Set the parent-child relationships
		this.head.parent = this.wholeBody;
		this.body.parent = this.wholeBody;
		this.legs.left.parent = this.wholeBody;
		this.legs.right.parent = this.wholeBody;
		this.arms.left.parent = this.wholeBody;
		this.arms.right.parent = this.wholeBody;
	}
}
