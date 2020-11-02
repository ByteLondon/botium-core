const assert = require('chai').assert
const JsonPathAsserter = require('../../../src/scripting/logichook/asserter/JsonPathAsserter')

describe('scripting.asserters.jsonPathAsserter', function () {
  beforeEach(async function () {
    this.jsonPathAsserter = new JsonPathAsserter({
      Match: (botresponse, utterance) => botresponse.toLowerCase().indexOf(utterance.toLowerCase()) >= 0
    }, {})
    this.jsonPathAsserterGlobalArgs = new JsonPathAsserter({
      Match: (botresponse, utterance) => botresponse.toLowerCase().indexOf(utterance.toLowerCase()) >= 0
    }, {}, { path: '$.test' })
  })

  it('should do nothing on no arg', async function () {
    await this.jsonPathAsserter.assertConvoStep({ })
  })
  it('should succeed on existing jsonpath', async function () {
    await this.jsonPathAsserter.assertConvoStep({
      convoStep: { stepTag: 'test' },
      args: ['$.test'],
      botMsg: {
        sourceData: {
          test: true
        }
      }
    })
  })
  it('should fail on not existing jsonpath', async function () {
    try {
      await this.jsonPathAsserter.assertConvoStep({
        convoStep: { stepTag: 'test' },
        args: ['$.test'],
        botMsg: {
          sourceData: {
          }
        }
      })
      assert.fail('expected jsonPathAsserter to fail')
    } catch (err) {
      assert.isTrue(err.message.includes('Could not find any element in jsonPath $.test'))
    }
  })
  it('should succeed on matching jsonpath', async function () {
    await this.jsonPathAsserter.assertConvoStep({
      convoStep: { stepTag: 'test' },
      args: ['$.test', 'test'],
      botMsg: {
        sourceData: {
          test: 'test'
        }
      }
    })
  })
  it('should succeed on matching jsonpath array', async function () {
    await this.jsonPathAsserter.assertConvoStep({
      convoStep: { stepTag: 'test' },
      args: ['$.test[0]', 'test'],
      botMsg: {
        sourceData: {
          test: ['test']
        }
      }
    })
  })
  it('should fail on not matching jsonpath', async function () {
    try {
      await this.jsonPathAsserter.assertConvoStep({
        convoStep: { stepTag: 'test' },
        args: ['$.test', 'test2'],
        botMsg: {
          sourceData: {
            test: 'test1'
          }
        }
      })
      assert.fail('should have failed')
    } catch (err) {
      assert.isTrue(err.message.indexOf('Expected: test2 in jsonPath $.test') > 0)
      assert.isNotNull(err.context)
      assert.isNotNull(err.context.cause)
      assert.isNotTrue(err.context.cause.not)
      assert.equal(err.context.cause.expected, 'test2')
      assert.equal(err.context.cause.actual, 'test1')
    }
  })
  it('should succeed on non existing jsonpath', async function () {
    await this.jsonPathAsserter.assertNotConvoStep({
      convoStep: { stepTag: 'test' },
      args: ['$.test'],
      botMsg: {
        sourceData: {
        }
      }
    })
  })
  it('should succeed on non matching jsonpath', async function () {
    await this.jsonPathAsserter.assertNotConvoStep({
      convoStep: { stepTag: 'test' },
      args: ['$.test', 'test2'],
      botMsg: {
        sourceData: {
          test: 'test1'
        }
      }
    })
  })
  it('should fail on matching jsonpath', async function () {
    try {
      await this.jsonPathAsserter.assertNotConvoStep({
        convoStep: { stepTag: 'test' },
        args: ['$.test', 'test1'],
        botMsg: {
          sourceData: {
            test: 'test1'
          }
        }
      })
      assert.fail('should have failed')
    } catch (err) {
      assert.isTrue(err.message.indexOf('Not expected: test1 in jsonPath $.test') > 0)
      assert.isNotNull(err.context)
      assert.isNotNull(err.context.cause)
      assert.isTrue(err.context.cause.not)
      assert.equal(err.context.cause.expected, 'test1')
      assert.equal(err.context.cause.actual, 'test1')
    }
  })

  it('should succeed on existing jsonpath from globalArgs', async function () {
    await this.jsonPathAsserterGlobalArgs.assertConvoStep({
      convoStep: { stepTag: 'test' },
      botMsg: {
        sourceData: {
          test: true
        }
      }
    })
  })
  it('should succeed on matching jsonpath from globalArgs', async function () {
    await this.jsonPathAsserter.assertConvoStep({
      convoStep: { stepTag: 'test' },
      args: ['test'],
      botMsg: {
        sourceData: {
          test: 'test'
        }
      }
    })
  })
  it('should fail on not existing jsonpath from globalArgs', async function () {
    try {
      await this.jsonPathAsserterGlobalArgs.assertConvoStep({
        convoStep: { stepTag: 'test' },
        botMsg: {
          sourceData: {
          }
        }
      })
      assert.fail('expected jsonPathAsserter to fail')
    } catch (err) {
      assert.isTrue(err.message.includes('Could not find any element in jsonPath $.test'))
    }
  })
  it('should fail on not matching jsonpath from globalArgs', async function () {
    try {
      await this.jsonPathAsserterGlobalArgs.assertConvoStep({
        convoStep: { stepTag: 'test' },
        args: ['test2'],
        botMsg: {
          sourceData: {
            test: 'test1'
          }
        }
      })
      assert.fail('should have failed')
    } catch (err) {
      assert.isTrue(err.message.indexOf('Expected: test2 in jsonPath $.test') > 0)
      assert.isNotNull(err.context)
      assert.isNotNull(err.context.cause)
      assert.isNotTrue(err.context.cause.not)
      assert.equal(err.context.cause.expected, 'test2')
      assert.equal(err.context.cause.actual, 'test1')
    }
  })

  it('should fail on invalid arg length from pathPattern', async function () {
    this.jsonPathAsserter.globalArgs = {
      argCount: 0,
      pathTemplate: '$.test'
    }
    try {
      await this.jsonPathAsserter.assertConvoStep({
        convoStep: { stepTag: 'test' },
        args: ['test2'],
        botMsg: {
          sourceData: {
            test: 'test1'
          }
        }
      })
      assert.fail('should have failed')
    } catch (err) {
      assert.isTrue(err.message.indexOf('JsonPathAsserter 0 arguments expected') > 0)
    }
  })
  it('should succeed on existing jsonpath from pathPattern', async function () {
    this.jsonPathAsserter.globalArgs = {
      argCount: 1,
      pathTemplate: '$.{{args.0}}'
    }

    await this.jsonPathAsserter.assertConvoStep({
      convoStep: { stepTag: 'test' },
      args: ['test'],
      botMsg: {
        sourceData: {
          test: true
        }
      }
    })
  })
  it('should succeed on existing jsonpath from pathPattern and assertPattern', async function () {
    this.jsonPathAsserter.globalArgs = {
      argCount: 2,
      pathTemplate: '$.{{args.0}}',
      assertTemplate: '{{args.1}}'
    }

    await this.jsonPathAsserter.assertConvoStep({
      convoStep: { stepTag: 'test' },
      args: ['test', 'value'],
      botMsg: {
        sourceData: {
          test: 'value'
        }
      }
    })
  })
  it('should fail on not matching jsonpath from pathPattern and assertPattern', async function () {
    this.jsonPathAsserter.globalArgs = {
      argCount: 2,
      pathTemplate: '$.{{args.0}}',
      assertTemplate: '{{args.1}}'
    }
    try {
      await this.jsonPathAsserter.assertConvoStep({
        convoStep: { stepTag: 'test' },
        args: ['test', 'value'],
        botMsg: {
          sourceData: {
            test: 'something else'
          }
        }
      })
      assert.fail('should have failed')
    } catch (err) {
      assert.isTrue(err.message.indexOf('Expected: value in jsonPath $.test') > 0)
    }
  })
})
