requirejs([
    'jquery',
    'underscore',
    'three',
    'model',
    'view',
    'viewcontroller',
    'opacityviewcontroller',
    'multi-model',
    'uistate'
], function($, _, THREE, model, DecompositionView, viewcontroller,
            OpacityViewController, MultiModel, UIState) {
  $(document).ready(function() {
    var ScalarViewControllerABC = viewcontroller.ScalarViewControllerABC;
    var DecompositionModel = model.DecompositionModel;
    var Plottable = model.Plottable;

    QUnit.module('OpacityViewController', {
      beforeEach() {
        this.sharedDecompositionViewDict = {};

        var UIState1 = new UIState();

        // setup function
        var data = {name: 'pcoa', sample_ids: ['PC.636', 'PC.635', 'PC.634'],
                    coordinates: [[-0.276542, -0.144964, 0.066647, -0.067711,
                                   0.176070, 0.072969,
                                   -0.229889, -0.046599],
                                  [-0.237661, 0.046053, -0.138136, 0.159061,
                                   -0.247485, -0.115211, -0.112864, 0.064794],
                                  [-0.237661, 0.046053, -0.138136, 0.159061,
                                    -0.247485, -0.115211, -0.112864, 0.064794]
                    ],
                    percents_explained: [26.6887048633, 16.2563704022,
                                         13.7754129161, 11.217215823,
                                         10.024774995, 8.22835130237,
                                         7.55971173665, 6.24945796136]};
        var md_headers = ['SampleID', 'Mixed', 'Treatment', 'DOB'];
        var metadata = [['PC.636', '14.2', 'Control', '20070314'],
        ['PC.635', 'StringValue', 'Fast', '20071112'],
        ['PC.634', '14.7', 'Fast', '20071112']];
        var decomp = new DecompositionModel(data, md_headers, metadata);
        var multiModel = new MultiModel({'scatter': decomp});
        var dv = new DecompositionView(multiModel, 'scatter', UIState1);
        this.sharedDecompositionViewDict.scatter = dv;

        data = {name: 'biplot', sample_ids: ['tax_1', 'tax_2'],
                coordinates: [[-1, -0.144964, 0.066647, -0.067711, 0.176070,
                               0.072969, -0.229889, -0.046599],
                              [-0.237661, 0.046053, -0.138136, 0.159061,
                               -0.247485, -0.115211, -0.112864, 0.064794]],
                percents_explained: [26.6887048633, 16.2563704022,
                                     13.7754129161, 11.217215823, 10.024774995,
                                     8.22835130237, 7.55971173665,
                                     6.24945796136]};
        md_headers = ['SampleID', 'Gram'];
        metadata = [['tax_1', '1'],
        ['tax_2', '0']];
        this.decomp = new DecompositionModel(data, md_headers, metadata);
        this.multiModel = new MultiModel({'scatter': this.decomp});
        this.dv = new DecompositionView(this.multiModel, 'scatter', UIState1);
        this.sharedDecompositionViewDict.biplot = dv;
      },
      afterEach() {
        this.sharedDecompositionViewDict = undefined;
        this.decomp = undefined;
        this.multiModel = undefined;
      }
    });

   QUnit.test('Constructor tests', function(assert) {
      const done = assert.async();
      var container = $('<div id="does-not-exist" style="height:11px; ' +
                        'width:12px"></div>');

      assert.ok(OpacityViewController.prototype instanceof
                ScalarViewControllerABC);

      var controller = new OpacityViewController(new UIState(), container,
        this.sharedDecompositionViewDict);

     $(function() {
         controller.setMetadataField('SampleID');
         assert.equal(controller.title, 'Opacity');

         var testColumn = controller.bodyGrid.getColumns()[0];
         assert.equal(testColumn.field, 'value');

         // verify the checked value is set properly
         assert.equal(controller.$scaledValue.is(':checked'), false);
         assert.equal(controller.$select.val(), 'SampleID');
         assert.equal(controller.getMetadataField(), 'SampleID');
         done();
     });
    });

   QUnit.test('Testing setPlottableAttributes helper function',
     function(assert) {
         // testing with one plottable
         var idx = 0;
         var plottables = [{idx: idx}];
         assert.deepEqual(this.dv.markers[idx].material.opacity, 1);
         assert.deepEqual(this.dv.markers[idx + 1].material.opacity, 1);

         OpacityViewController.prototype.setPlottableAttributes(this.dv, 0.5,
                                                                plottables);

         assert.deepEqual(this.dv.markers[idx].material.opacity, 0.5);
         assert.deepEqual(this.dv.markers[idx + 1].material.opacity, 1);
         assert.equal(this.dv.needsUpdate, true);

         // testing with multiple plottable
         plottables = [{idx: idx}, {idx: idx + 1}];
         OpacityViewController.prototype.setPlottableAttributes(this.dv, 0.4,
                                                                plottables);
         assert.deepEqual(this.dv.markers[idx].material.opacity, 0.4);
         assert.deepEqual(this.dv.markers[idx + 1].material.opacity, 0.4);
         assert.equal(this.dv.needsUpdate, true);
    });

   QUnit.test('Testing toJSON', function(assert) {
      const done = assert.async();
      var container = $('<div id="does-not-exist" style="height:11px; ' +
                        'width:12px"></div>');
      var controller = new OpacityViewController(new UIState(),
        container, this.sharedDecompositionViewDict);

      $(function() {
          controller.setMetadataField('SampleID');

          var obs = controller.toJSON();
          var exp = {category: 'SampleID', globalScale: '1', scaleVal: false,
                     data: {'PC.636': 1, 'PC.635': 1, 'PC.634': 1}};
          assert.deepEqual(obs, exp);
          done();
      });
    });

   QUnit.test('Testing fromJSON', function(assert) {
      const done = assert.async();
      var json = {category: 'SampleID', globalScale: '1.0', scaleVal: false,
                  data: {'PC.636': 0.1, 'PC.635': 1, 'PC.634': 0.7}};

      var container = $('<div id="does-not-exist" style="height:11px; ' +
                        'width:12px"></div>');
      var controller = new OpacityViewController(new UIState(),
        container, this.sharedDecompositionViewDict);

      $(function() {
          controller.fromJSON(json);

          var scatter = controller.decompViewDict.scatter;
          assert.deepEqual(scatter.markers[0].material.opacity, 0.1);
          assert.deepEqual(scatter.markers[1].material.opacity, 1);
          assert.deepEqual(scatter.markers[2].material.opacity, 0.7);
          assert.equal(controller.$select.val(), 'SampleID');
          assert.equal(controller.$scaledValue.is(':checked'), false);

          done();
      });
    });

   QUnit.test('Testing fromJSON scaled', function(assert) {
      const done = assert.async();
      var json = {category: 'DOB', globalScale: '1.0', scaleVal: true,
                  data: {'20070314': 0.1, '20071112': 0.5}};

      var container = $('<div id="does-not-exist" style="height:11px; ' +
                        'width:12px"></div>');
      var controller = new OpacityViewController(new UIState(),
        container, this.sharedDecompositionViewDict);

      $(function() {
          controller.fromJSON(json);
          var scatter = controller.decompViewDict.scatter;
          assert.deepEqual(scatter.markers[0].material.opacity, 0.1);
          assert.deepEqual(scatter.markers[1].material.opacity, 0.5);

          assert.equal(controller.$select.val(), 'DOB');
          assert.equal(controller.$scaledValue.is(':checked'), true);

          done();
      });
    });

   QUnit.test('Testing toJSON (null)', function(assert) {
      const done = assert.async();
      var container = $('<div id="does-not-exist" style="height:11px; ' +
                        'width:12px"></div>');
      var controller = new OpacityViewController(new UIState(),
        container, this.sharedDecompositionViewDict);

      $(function() {
          controller.setMetadataField(null);

          var obs = controller.toJSON();
          var exp = {category: null, globalScale: '1.0', scaleVal: false,
                     data: {}};
          assert.deepEqual(obs, exp);

          done();
      });
    });

   QUnit.test('Testing fromJSON (null)', function(assert) {
      const done = assert.async();
      var json = {category: null, globalScale: '1.0', scaleVal: false,
                  data: {}};

      var container = $('<div id="does-not-exist" style="height:11px; ' +
                        'width:12px"></div>');
      var controller = new OpacityViewController(new UIState(),
        container, this.sharedDecompositionViewDict);

      $(function() {
          controller.fromJSON(json);
          var idx = 0;
          var scatter = controller.decompViewDict.scatter;
          assert.deepEqual(scatter.markers[0].material.opacity, 1);
          assert.deepEqual(scatter.markers[1].material.opacity, 1);
          assert.equal(controller.getMetadataField(), null);
          assert.equal(controller.$scaledValue.is(':checked'), false);
          done();
      });
    });

   QUnit.test('Testing getScale', function(assert) {
      var container = $('<div id="does-not-exist" style="height:11px; ' +
                        'width:12px"></div>');
      var controller = new OpacityViewController(new UIState(),
        container, this.sharedDecompositionViewDict);
      var data = ['1.0', 'no', 'false', 'something', '2.0'];

      //test standard values
      var obs = controller.getScale(data, false);
      var exp = {'1.0': 1, 'no': 1, 'false': 1, 'something': 1, '2.0': 1};
     assert.deepEqual(obs, exp);

      //test scaled values
      obs = controller.getScale(data, true);
      exp = {'1.0': 0, 'no': 0, 'false': 0, 'something': 0, '2.0': 1};
     assert.deepEqual(obs, exp);
    });
  });
});
