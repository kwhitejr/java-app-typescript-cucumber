const config = {
  default: {
    require: [
      'ts-node/register',
      'step-definitions/**/*.ts',
      'support/**/*.ts'
    ],
    format: [
      'progress',
      'json:reports/cucumber_report.json',
      'html:reports/cucumber_report.html'
    ],
    paths: ['features/**/*.feature'],
    requireModule: ['ts-node/register'],
    retry: 0,
    parallel: 1
  },
  dev: {
    format: ['progress'],
    retry: 0
  },
  ci: {
    format: [
      'progress',
      'json:reports/cucumber_report.json',
      'junit:reports/cucumber_report.xml'
    ],
    retry: 1
  }
};

module.exports = config;