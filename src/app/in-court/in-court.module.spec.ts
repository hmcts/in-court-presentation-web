import { InCourtModule } from './in-court.module';

describe('InCourtModule', () => {
  let inCourtModule: InCourtModule;

  beforeEach(() => {
    inCourtModule = new InCourtModule();
  });

  it('should create an instance', () => {
    expect(inCourtModule).toBeTruthy();
  });
});
