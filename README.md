# ByteWeave - Digital Logic Simulator

ByteWeave is a web-based application that allows students to simulate digital circuits using a variety of logic gates, including AND, OR, NOT, NAND, NOR, INPUT, OUTPUT, and Seven Segment Displays. Instructors can also create assignments with custom logic circuits that are automatically graded.

## Table of Contents

- [Examples](#examples)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Creating Assignments](#creating-assignments)
  - [Simulating Circuits](#simulating-circuits)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Examples
- [Free Roam](https://byteweave.dacoder.io/)
- [Example Lab](https://lab5.dacoder.io/)

## Features

- Simulate digital circuits in the browser.
- Use various logic gates to design complex circuits.
- Create custom assignments for students with automatic grading.

## Installation

To get started with ByteWeave, follow these steps:

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/dakotacookenmaster/ByteWeave.git
   ```

2. Navigate to the project directory:

   ```bash
   cd ByteWeave
   ```

3. Install the required dependencies using NPM or Yarn:

   ```bash
   yarn install

   OR
   
   npm install
   ```

4. Start the development server:

   ```bash
   yarn dev

   OR
   
   npm run dev
   ```

5. Open your web browser and access the application at `http://localhost:3000`.

## Usage

### Creating Assignments

Instructors can create custom assignments for students by defining the assignment details in the `assignment.json` file. You can find all available options in the `Assignment.type.ts` file, but here is a simple example:

```json
{
    "assignmentName": "CPTR-108 Lab 5: Digital Logic",
    "canSkipAnyQuestion": false,
    "gatesProvidedInEveryQuestion": [],
    "questions": [
        {
            "instructions": {
                "title": "DeMorgan's OR",
                "description": "Build a circuit with the same functionality as an OR gate using only AND and NOT gates.",
                "resources": []
            },
            "gatesProvided": [
                "AND",
                "NOT"
            ],
            "canSkip": true,
            "answer": {
                // Define circuit details here
            }
        },
        {
            // Define more questions here
        }
    ]
}
```

### Simulating Circuits

1. Launch ByteWeave in your browser.

2. Create a circuit.

3. Use the provided logic gates to design your circuit.

4. Simulate the circuit to observe its behavior.

5. Automatically grade the assignment by clicking "Check Answer" to compare it to the provided truth table.

## Dependencies

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Material-UI](https://mui.com/)
- [react-draggable](https://www.npmjs.com/package/react-draggable)
- [react-archer](https://www.npmjs.com/package/react-archer)
- [notistack](https://www.npmjs.com/package/notistack)
- [lodash](https://lodash.com/)

## Contributing

If you'd like to contribute to ByteWeave, please follow these guidelines:

1. Fork the repository on GitHub.

2. Clone your forked repository to your local machine.

3. Create a new branch for your feature or bug fix:

   ```bash
   git checkout -b feature/new-feature
   ```

4. Make your changes and commit them with clear messages.

5. Push your changes to your forked repository:

   ```bash
   git push origin feature/new-feature
   ```

6. Create a pull request from your branch to the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Enjoy using ByteWeave to explore the fascinating world of digital logic circuits! If you encounter any issues or have suggestions for improvements, please don't hesitate to [open an issue](https://github.com/dakotacookenmaster/ByteWeave/issues). Happy circuit designing!
