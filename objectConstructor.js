const mockedObj = [
	{ fullName: { surname: "xxx", firstName: "yyy", middleName: "zzz" } },
	{ fullName: { surname: "XXX", firstName: "YYY", middleName: "ZZZ" } },
	{ fullName: { surname: "solo", firstName: "danylo", middleName: "serg" } },
];

const formatConditions = {
	fullName: { surname: true, firstName: true, middleName: false },
};

const localizations = {
	"fullName.surname": "Прізвище",
	"fullName.middleName": "По-батькові",
};

const flatten = object => {
	// A function to flatten array;
	return Object.assign(
		{},
		...(function _flatten(child, path = []) {
			return [].concat(
				...Object.keys(child).map(key =>
					typeof child[key] === "object"
						? _flatten(child[key], path.concat([key]))
						: { [path.concat([key]).join(".")]: child[key] },
				),
			);
		})(object),
	);
};

const formatValue = value => {
	const toDate = new Date(value);
	if (typeof value === "boolean") {
		return value ? "Так" : "Нi";
	} else if (Number.isInteger(value)) {
		return value;
	} else if (toDate != "Invalid Date") {
		let current_datetime = new Date(value);
		let formatted_date =
			current_datetime.getDate() +
			"." +
			current_datetime.getMonth() +
			"." +
			current_datetime.getFullYear();
		return formatted_date;
	} else {
		return value;
	}
};

const mapValues = (objectsArr, key, objToMap) =>
	objectsArr.forEach((obj, index) => {
		const flattenedObj = flatten(obj);
		const customKey = `value${index + 1}`;
		if (flattenedObj[key]) {
			const formatedValue = formatValue(flattenedObj[key]);
			objToMap[customKey] = formatedValue;
		}
	});

const transformObject = (objectsArr, conditions, localizations) => {
	if (!objectsArr.length || !conditions || !localizations)
		return "Some of inputs are missing or in a wrong format";
	// main function
	let targetArray = [];
	const flattenedConditions = flatten(conditions);
	for (i in flattenedConditions) {
		const targetObject = {};
		if (flattenedConditions[i]) {
			//checks if key is true in conditions
			const fullKeyName = localizations[i];
			const shortKeyName =
				i.lastIndexOf(".") !== -1 ? i.slice(i.lastIndexOf(".") + 1) : ""; // cut a key to the first dot
			targetObject.name = fullKeyName ? fullKeyName : shortKeyName; // in case if there is no localization
			mapValues(objectsArr, i, targetObject); // maps values under specific keys
			targetArray.push(targetObject);
		}
	}
	return targetArray;
};

transformObject(mockedObj, formatConditions, localizations);

// TESTS --------------------------------------------------------------------------------

const setOfInputs = [
	{
		object: [],
		expectedResult: "Some of inputs are missing or in a wrong format",
	},
	{
		object: [
			{ fullName: { surname: "xxx", firstName: "yyy", middleName: "zzz" } },
			{ fullName: { surname: "XXX", firstName: "YYY", middleName: "ZZZ" } },
			{
				fullName: { surname: "solo", firstName: "danylo", middleName: "serg" },
			},
		],
		rules: { fullName: { surname: true, firstName: true, middleName: false } },
		localizations: {
			"fullName.surname": "Прізвище",
			"fullName.middleName": "По-батькові",
		},
		expectedResult: [
			{ name: "Прізвище", value1: "xxx", value2: "XXX", value3: "solo" },
			{ name: "firstName", value1: "yyy", value2: "YYY", value3: "danylo" },
		],
	},
	{
		object: [
			{ surname: "xxx", firstName: "yyy", middleName: "zzz" },
			{ surname: "XXX", firstName: "YYY", middleName: "ZZZ" },
			{
				surname: "solo",
				firstName: "danylo",
				middleName: "serg",
			},
		],
		rules: { surname: true, firstName: true, middleName: false },
		localizations: {
			surname: "Прізвище",
			firstName: "Имя",
		},
		expectedResult: [
			{ name: "Прізвище", value1: "xxx", value2: "XXX", value3: "solo" },
			{ name: "Имя", value1: "yyy", value2: "YYY", value3: "danylo" },
		],
	},
	{
		object: [
			{
				apples: {
					color: "rad",
					form: "round",
					extraNotes: { sort: "golden", size: "big" },
				},
			},
			{
				apples: {
					color: "orange",
					form: "long",
					extraNotes: { sort: "greeny", size: "medium" },
				},
			},
			{
				apples: {
					color: "solo",
					form: "square",
					extraNotes: { sort: "semerin", size: "small" },
				},
			},
		],
		rules: {
			apples: {
				color: true,
				form: false,
				extraNotes: { sort: true, size: true },
			},
		},
		localizations: {
			"apples.extraNotes.sort": "Сорт фрукта",
			"apples.extraNotes.size": "Размер фрукта",
		},
		expectedResult: [
			{ name: "color", value1: "rad", value2: "orange", value3: "solo" },
			{
				name: "Сорт фрукта",
				value1: "golden",
				value2: "greeny",
				value3: "semerin",
			},
			{
				name: "Размер фрукта",
				value1: "big",
				value2: "medium",
				value3: "small",
			},
		],
	},
];

setOfInputs.forEach(inputData => {
	const functionOutput = transformObject(
		inputData.object,
		inputData.rules,
		inputData.localizations,
	);
	const consoleOutput =
		JSON.stringify(
			transformObject(
				inputData.object,
				inputData.rules,
				inputData.localizations,
			),
		) === JSON.stringify(inputData.expectedResult)
			? console.log(
					"Passed----------------------------------------------------------------------------",
					"\n",
					"expected:",
					inputData.expectedResult,
					"\n",
					"got:",
					functionOutput,
			  )
			: console.error(
					"Failed-------------------------------------------------------------------------------",
					"\n",
					"expected:",
					inputData.expectedResult,
					"\n",
					"got:",
					functionOutput,
			  );
});
