import * as path from 'path';
import * as fs from 'fs';

describe('Project Structure (e2e)', () => {
  describe('Module files should exist', () => {
    it('should have Events module', () => {
      const eventModulePath = path.join(
        __dirname,
        '../src/events/events.module.ts',
      );
      expect(fs.existsSync(eventModulePath)).toBe(true);
    });

    it('should have Teams module', () => {
      const teamsModulePath = path.join(
        __dirname,
        '../src/teams/teams.module.ts',
      );
      expect(fs.existsSync(teamsModulePath)).toBe(true);
    });

    it('should have Attendance module', () => {
      const attendanceModulePath = path.join(
        __dirname,
        '../src/attendance/attendance.module.ts',
      );
      expect(fs.existsSync(attendanceModulePath)).toBe(true);
    });

    it('should have Player Enrollment module', () => {
      const enrollmentModulePath = path.join(
        __dirname,
        '../src/player-enrollment/player-enrollment.module.ts',
      );
      expect(fs.existsSync(enrollmentModulePath)).toBe(true);
    });
  });

  describe('Controller files should exist', () => {
    it('should have Events controller', () => {
      const controllerPath = path.join(
        __dirname,
        '../src/events/events.controller.ts',
      );
      expect(fs.existsSync(controllerPath)).toBe(true);
    });

    it('should have Teams controller', () => {
      const controllerPath = path.join(
        __dirname,
        '../src/teams/teams.controller.ts',
      );
      expect(fs.existsSync(controllerPath)).toBe(true);
    });

    it('should have Attendance controller', () => {
      const controllerPath = path.join(
        __dirname,
        '../src/attendance/attendance.controller.ts',
      );
      expect(fs.existsSync(controllerPath)).toBe(true);
    });

    it('should have Player Enrollment controller', () => {
      const controllerPath = path.join(
        __dirname,
        '../src/player-enrollment/player-enrollment.controller.ts',
      );
      expect(fs.existsSync(controllerPath)).toBe(true);
    });
  });

  describe('Service files should exist', () => {
    it('should have Events service', () => {
      const servicePath = path.join(
        __dirname,
        '../src/events/events.service.ts',
      );
      expect(fs.existsSync(servicePath)).toBe(true);
    });

    it('should have Teams service', () => {
      const servicePath = path.join(__dirname, '../src/teams/teams.service.ts');
      expect(fs.existsSync(servicePath)).toBe(true);
    });

    it('should have Attendance service', () => {
      const servicePath = path.join(
        __dirname,
        '../src/attendance/attendance.service.ts',
      );
      expect(fs.existsSync(servicePath)).toBe(true);
    });

    it('should have Player Enrollment service', () => {
      const servicePath = path.join(
        __dirname,
        '../src/player-enrollment/player-enrollment.service.ts',
      );
      expect(fs.existsSync(servicePath)).toBe(true);
    });
  });

  describe('Configuration files should exist', () => {
    it('should have package.json', () => {
      const pkgPath = path.join(__dirname, '../package.json');
      expect(fs.existsSync(pkgPath)).toBe(true);
    });

    it('should have tsconfig.json', () => {
      const tsconfigPath = path.join(__dirname, '../tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
    });

    it('should have nest-cli.json', () => {
      const nestCliPath = path.join(__dirname, '../nest-cli.json');
      expect(fs.existsSync(nestCliPath)).toBe(true);
    });
  });
});
