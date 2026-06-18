# SRLS - Sandia RPM Lane Simulator

## Executables

The most recent releases are kept at: https://github.com/sandialabs/SRLS/releases

## Building and Running

### Project setup

```
npm install
```

### Compile and run in Electron (with hot reloads)

> Because the NodeJS back-end does a lot of the work, SRLS cannot be run apart from the electron environment. Appropriate debugging can be done, however, through VSCode using the provided launch configurations.

### Creating an installer

To create an installer for SRLS, run the following command.

```
npm run app:build
```

This will create an installer for the platform that you are running on and put it in ./release/x.y.z

| Platform | Build Product        |
| -------- | -------------------- |
| Windows  | Sandia RPM Lane Simulator_x.y.z.exe |
| Mac      | Sandia RPM Lane Simulator_x.y.z.dmg |
| Linux    | TBD |

### Creating a new release

Run the npm script:
```
npm run release
```
to increment the build patch version by 1 (i.e., from 1.2.111 to 1.2.112)

### Creating a new installer

Run the npm script:
```
npm run new-release
```

which will run the two scripts that increment the patch version and then build the installer

## License

This project is licensed under the MIT license.

## Copyright

Copyright 2026 National Technology & Engineering Solutions of Sandia, LLC (NTESS). Under the terms of Contract DE-NA0003525 with NTESS, the U.S. Government retains certain rights in this software.

Sandia National Laboratories is a multimission laboratory managed and operated by National Technology & Engineering Solutions of Sandia, LLC, a wholly owned subsidiary of Honeywell International Inc., for the U.S. Department of Energy’s National Nuclear Security Administration under contract DE-NA0003525

## Acknowledgement

The Sandia RPM Lane Simulator was developed with funds from the National Nuclear Security Administration of the US Department of Energy.

## Privacy Policy

The Sandia RPM Lane Simulator (SRLS) application does not collect or store any personal information. SRLS stores application configuration information locally on your computer. This information does not leave your computer, and can be deleted by removing the application data folder in the operating system's standard location for the application.
