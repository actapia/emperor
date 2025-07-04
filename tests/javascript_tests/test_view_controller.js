requirejs([
    'jquery',
    'underscore',
    'model',
    'view',
    'abcviewcontroller',
    'viewcontroller',
    'slickgrid',
    'multi-model',
    'uistate'
], function($, _, model, DecompositionView, abc, viewcontroller,
            SlickGrid, MultiModel, UIState) {
  var EmperorViewControllerABC = abc.EmperorViewControllerABC;
  var EmperorViewController = viewcontroller.EmperorViewController;
  var EmperorAttributeABC = viewcontroller.EmperorAttributeABC;
  var DecompositionModel = model.DecompositionModel;

  $(document).ready(function() {

    QUnit.module('EmperorViewControllerABC', {
    });

    /**
     *
     * Test that the constructor for EmperorViewControllerABC.
     *
     */
   QUnit.test('Constructor tests', function(assert) {

      var container = $('<div id="does-not-exist" style="height:11px; ' +
                        'width:12px"></div>');
      var controller = new EmperorViewControllerABC(new UIState(), container,
                                                    'foo', 'bar');

     assert.equal(controller.title, 'foo', 'Check the title is correctly set');
     assert.equal(controller.description, 'bar',
            'Check the description is correctly set');
     assert.equal(controller.$container.id,
                  container.id,
                  'Check the id of the parent is correct');
     assert.equal(controller.active, false, 'Check the active property');
     assert.equal(controller.identifier.slice(0, 7), 'EMPtab-',
            'Check the identifier property');
      parseFloat(controller.identifier.slice(7));
     assert.equal(controller.enabled, true, 'Check the enabled property');

      // check all the elements were successfully created
      assert.ok(controller.$canvas.length);
      assert.ok(controller.$header.length);
      assert.ok(controller.$body.length);

      assert.ok($.contains(controller.$canvas[0], controller.$header[0]));
      assert.ok($.contains(controller.$canvas[0], controller.$body[0]));

     assert.equal(controller.$body.width(), 12);
     assert.equal(controller.$body.height(), 11);

    });

    /**
     *
     * Test the enabled method
     *
     */
   QUnit.test('Test the enabled method works', function(assert) {

      var container = $('<div id="does-not-exist"></div>');
      var controller = new EmperorViewControllerABC(new UIState(), container,
                                                    'foo', 'bar');

     assert.equal(controller.enabled, true);
      controller.setEnabled(false);
     assert.equal(controller.enabled, false);

     assert.throws(function() {
        controller.setEnabled('shenanigans');
      }, Error, 'setEnabled can only take a boolean');
    });

    /**
     *
     * Test the enabled method
     *
     */
   QUnit.test('Test the setActive method works', function(assert) {

      var container = $('<div id="does-not-exist"></div>');
      var controller = new EmperorViewControllerABC(new UIState(), container,
                                                    'foo', 'bar');

     assert.equal(controller.active, false);
      controller.setActive(true);
     assert.equal(controller.active, true);

     assert.throws(function() {
        controller.setActive('shenanigans');
      }, Error, 'setActive can only take a boolean');
    });

    /**
     *
     * Test the resize method.
     *
     */
   QUnit.test('Test the resize method', function(assert) {

      var container = $('<div id="does-not-exist"></div>');
      var controller = new EmperorViewControllerABC(new UIState(), container,
                                                    'foo', 'bar');

      // header of size 0
      controller.resize(20, 10);
     assert.equal(controller.$header.height(), 0);
     assert.equal(controller.$header.width(), 10); // because of padding
     assert.equal(controller.$body.height(), 10);
     assert.equal(controller.$body.width(), 10); // because of padding

      controller.$header.height(11);
      controller.resize(30, 30);
     assert.equal(controller.$header.height(), 11);
     assert.equal(controller.$header.width(), 20); //because of padding
     assert.equal(controller.$body.height(), 19);
     assert.equal(controller.$body.width(), 20); //because of padding
    });

    /**
     *
     * Test the resize, toJSON and fromJSON methods raise the appropriate
     * errors.
     *
     */
   QUnit.test('Test resize, toJSON and fromJSON methods', function(assert) {

      var container = $('<div id="does-not-exist"></div>');
      var controller = new EmperorViewControllerABC(new UIState(), container,
                                                    'foo', 'bar');

     assert.throws(function() {
        controller.fromJSON('{foo:11}');
      }, Error, 'Cannot call this abstract method');

     assert.throws(function() {
        controller.toJSON();
      }, Error, 'Cannot call this abstract method');
    });

    QUnit.module('EmperorViewController', {

      beforeEach() {
        this.sharedDecompositionViewDict = {};

        var UIState1 = new UIState();
        this.UIState1 = UIState1;
        // setup function
        var data = {name: 'pcoa', sample_ids: ['PC.636', 'PC.635'],
                    coordinates: [[-0.276542, -0.144964, 0.066647, -0.067711,
                                   0.176070, 0.072969, -0.229889, -0.046599],
                                  [-0.237661, 0.046053, -0.138136, 0.159061,
                                   -0.247485, -0.115211, -0.112864, 0.064794]],
                    percents_explained: [26.6887048633, 16.2563704022,
                                         13.7754129161, 11.217215823,
                                         10.024774995, 8.22835130237,
                                         7.55971173665, 6.24945796136]};
        var md_headers = ['SampleID', 'LinkerPrimerSequence', 'Treatment',
                          'DOB'];
        var metadata = [['PC.636', 'YATGCTGCCTCCCGTAGGAGT', 'Control',
                         '20070314'],
                        ['PC.635', 'YATGCTGCCTCCCGTAGGAGT', 'Fast',
                         '20071112']];
        var decomp = new DecompositionModel(data, md_headers, metadata);
        var multiModel = new MultiModel({'scatter': decomp});
        var dv = new DecompositionView(multiModel, 'scatter', UIState1);
        this.sharedDecompositionViewDict.pcoa = dv;

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
        metadata = [['tax_1', '1'], ['tax_2', '0']];
        decomp = new DecompositionModel(data, md_headers, metadata);
        multiModel = new MultiModel({'scatter': decomp});
        dv = new DecompositionView(multiModel, 'scatter', UIState1);
        this.sharedDecompositionViewDict.biplot = dv;
        this.decomp = decomp;
        this.multiModel = new MultiModel({'scatter': this.decomp});

      },
      afterEach() {
        this.sharedDecompositionViewDict = undefined;
        this.decomp = undefined;
        this.multiModel = undefined;
      }
    });

    /**
     *
     * Test the constructor for EmperorViewController.
     *
     */
   QUnit.test('Constructor tests', function(assert) {
      var container = $('<div id="does-not-exist"></div>');

      // verify the subclassing was set properly
      assert.ok(EmperorViewController.prototype instanceof
                EmperorViewControllerABC);
      var attr = new EmperorViewController(this.UIState1, container,
          'foo', 'bar', this.sharedDecompositionViewDict);
     assert.deepEqual(_.keys(attr.decompViewDict), ['pcoa', 'biplot']);
    });

   QUnit.test('Test hasMetadataField', function(assert) {
      var container = $('<div id="does-not-exist"></div>');

      var controller = new EmperorViewController(this.UIState1, container,
          'foo', 'bar', this.sharedDecompositionViewDict);

     assert.equal(controller.hasMetadataField('DOB'), true);
     assert.equal(controller.hasMetadataField('PLEL'), false);
    });

    /**
     *
     * Tests to make sure the exceptions are being raised as expected
     *
     */
   QUnit.test('Constructor test exceptions', function(assert) {
      var dv = new DecompositionView(this.multiModel, 'scatter', new UIState());

     assert.throws(function() {
        new EmperorViewController(new UIState(), container, 'foo', 'bar',
            {1: 1, 2: 2}, {});

      }, Error, 'The decomposition view dictionary ' +
      'can only have decomposition views');

     assert.throws(function() {
        new EmperorViewController(new UIState(), container, 'foo', 'bar',
            {}, {});
      }, Error, 'The decomposition view dictionary cannot be empty');
    });

    /**
     *
     * Test the active decomposition view can be correctly retrieved
     *
     */
   QUnit.test('Test getView', function(assert) {
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      var attr = new EmperorViewController(state, container, 'foo', 'bar',
                                           {'scatter': dv});
     assert.deepEqual(attr.getView(), dv);
    });

    QUnit.module('EmperorAttributeABC', {

      beforeEach() {
        this.sharedDecompositionViewDict = {};
        var $slickid = $('<div id="fooligans"></div>');
        $slickid.appendTo(document.body);

        var UIState1 = new UIState();

        // setup function
        var data = {name: 'pcoa', sample_ids: ['PC.636', 'PC.635'],
                    coordinates: [[-0.276542, -0.144964, 0.066647, -0.067711,
                                   0.176070, 0.072969, -0.229889, -0.046599],
                                  [-0.237661, 0.046053, -0.138136, 0.159061,
                                   -0.247485, -0.115211, -0.112864, 0.064794]],
                    percents_explained: [26.6887048633, 16.2563704022,
                                         13.7754129161, 11.217215823,
                                         10.024774995, 8.22835130237,
                                         7.55971173665, 6.24945796136]};
        var md_headers = ['SampleID', 'LinkerPrimerSequence', 'Treatment',
                          'DOB'];
        var metadata = [
          ['PC.636', 'YATGCTGCCTCCCGTAGGAGT', 'Control', '20070314'],
          ['PC.635', 'YATGCTGCCTCCCGTAGGAGT', 'Fast', '20071112']
        ];

        var decomp = new DecompositionModel(data, md_headers, metadata);
        var multiModel = new MultiModel({'scatter': decomp});
        var dv = new DecompositionView(multiModel, 'scatter', UIState1);
        this.sharedDecompositionViewDict.pcoa = dv;

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
        metadata = [['tax_1', '1'], ['tax_2', '0']];
        decomp = new DecompositionModel(data, md_headers, metadata);
        multiModel = new MultiModel({'scatter': decomp});
        dv = new DecompositionView(multiModel, 'scatter', UIState1);
        this.sharedDecompositionViewDict.biplot = dv;

        // Slickgrid
        var columns = [
        {id: 'pc1', name: 'pc1', field: 'pc1'},
        {id: 'pc2', name: 'pc2', field: 'pc2'},
        {id: 'pc3', name: 'pc3', field: 'pc3'}
        ];

        this.options = {
          enableCellNavigation: true,
          enableColumnReorder: false
        };
        var data = [];
        data.push({'pc1': 1, 'pc2': 1, 'pc3': 1});
        data.push({'pc1': 1, 'pc2': 1, 'pc3': 2});

        var grid = new Slick.Grid('#fooligans', data, columns, this.options);
        this.decomp = decomp;
        this.multiModel = new MultiModel({'scatter': this.decomp});
      },
      afterEach() {
        this.sharedDecompositionViewDict = undefined;
        $('#fooligans').remove();
        this.decomp = undefined;
        this.multiModel = undefined;
      }
    });

    /**
     *
     * Test the constructor for EmperorViewControllerABC.
     *
     */
   QUnit.test('Constructor tests', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');

      // verify the subclassing was set properly
      assert.ok(EmperorAttributeABC.prototype instanceof
                EmperorViewController);
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
          this.sharedDecompositionViewDict, {});


      var met = {'biplot': ['Gram', 'SampleID'],
                 'pcoa': ['DOB', 'LinkerPrimerSequence', 'SampleID',
                          'Treatment']};

       $(function() {
           assert.deepEqual(attr._metadata, met);
           done();
       }
        );
    });

    /**
     *
     * Test to see if the grid is being built correctly
     *
     */
    QUnit.test('Constructor test buildGrid', function(assert) {
      const done = assert.async();
      var options = {};
      options.slickGridColumn = {id: 'title', name: 'spam', field: 'test',
        sortable: false, maxWidth: 10, minWidth: 10};
      var container = $('<div id="does-not-exist"></div>');
      var attr = new EmperorAttributeABC(new UIState(), container, 'foo', 'bar',
          this.sharedDecompositionViewDict,
          options);

      $(function() {
        var testColumn = attr.bodyGrid.getColumns()[0];
       assert.equal(testColumn.name, 'spam');
       assert.equal(testColumn.field, 'test');

        done();
      });
    });

    /**
     *
     * Test to see if the grid is being built correctly
     *
     */
    QUnit.test('Test resize', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist" style="height:20px; ' +
                        'width:21px"></div>');

      // verify the subclassing was set properly
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
          this.sharedDecompositionViewDict, {});

      $(function() {
        attr.resize(20, 30);
       assert.equal(attr.$body.width(), 10); // because of padding
       assert.equal(attr.$body.height(), 30 - attr.$header.height());
       assert.equal(attr.$header.width(), 10); // because of padding

        done();
      });
    });


   QUnit.test('Test decompositionName method', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
                                         {'scatter': dv}, {});
       $(function() {
           assert.equal(attr.decompositionName(), 'scatter');
           done();
       });
    });

   QUnit.test('Test getView method', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
                                         {'scatter': dv}, {});
       $(function() {
           assert.deepEqual(attr.getView(), dv);
           done();
       });
    });

    /**
     *
     * Test get metadata field
     *
     */
   QUnit.test('Test getMetadataField', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
                                         {'scatter': dv}, {});
       $(function() {
           assert.equal(attr.getMetadataField(), 'Gram');
           done();
       });
    });

    /**
     *
     * Test set metadata field
     *
     */
   QUnit.test('Test setMetadataField', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
                                         {'scatter': dv}, {});

       $(function() {
           attr.setMetadataField('SampleID');
           assert.equal(attr.getMetadataField(), 'SampleID');

           attr.setMetadataField(null);
           assert.equal(attr.getMetadataField(), null);

           done();
       });
    });

    /**
     *
     * Test set metadata field
     *
     */
   QUnit.test('Test setMetadataField exceptions', function(assert) {
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
          {'scatter': dv}, {});
     assert.throws(function() {
              attr.setMetadataField('cheese');
             }, /cheese/, 'Raise error that contains the word cheese');
    });


    /**
     *
     * Test get/set slick grid dataset.
     *
     */
    QUnit.test('Test setSlickGridDataset', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
          {'scatter': dv, 'biplot': dv}, {});

      $(function() {
        attr.setSlickGridDataset([{'id': 1, 'pc1': 1, 'pc2': 2, 'pc3': 3},
            {'id': 2, 'pc1': 1, 'pc2': 1, 'pc3': 2}]);
       assert.deepEqual(attr.getSlickGridDataset(), [
            {'id': 1, 'pc1': 1, 'pc2': 2, 'pc3': 3},
            {'id': 2, 'pc1': 1, 'pc2': 1, 'pc3': 2}]);

        done();
      });
    });


    /**
     *
     * Test refresh metadata.
     *
     */
    QUnit.test('Test refreshMetadata', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      var shared = {'scatter': this.sharedDecompositionViewDict.pcoa};
      var scope = this;
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
                                         shared, {});

      $(function() {
        // modify the decomposition view dictionary
        shared.biplot = scope.sharedDecompositionViewDict.biplot;

       assert.deepEqual(attr._metadata,
                        {'scatter': ['DOB', 'LinkerPrimerSequence',
                                     'SampleID', 'Treatment']});
        attr.refreshMetadata();
       assert.deepEqual(attr._metadata,
                        {'scatter': ['DOB', 'LinkerPrimerSequence',
                                     'SampleID', 'Treatment'],
                         'biplot': ['Gram', 'SampleID']});

        done();
      });
    });

    /**
     *
     * Test setEnabled (false)
     *
     */
    QUnit.test('Test setEnabled (false)', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
                                         {'scatter': dv}, {});
      $(function() {
        // disable
        attr.setEnabled(false);

       assert.equal(attr.enabled, false);
       assert.equal(attr.$select.is(':disabled'), true);
       assert.equal(attr.$searchBar.is(':disabled'), true);
       assert.equal(attr.bodyGrid.getOptions().editable, false);

        // enable
        attr.setEnabled(true);

       assert.equal(attr.enabled, true);
       assert.equal(attr.$select.is(':disabled'), false);
       assert.equal(attr.$searchBar.is(':disabled'), false);
       assert.equal(attr.bodyGrid.getOptions().editable, true);

        done();
      });
    });

    /**
     *
     * Test setEnabled (true)
     *
     */
    QUnit.test('Test setEnabled (true)', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var dv = new DecompositionView(this.multiModel, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
                                         {'scatter': dv}, {});
      $(function() {
        // Controllers should be enabled
       assert.equal(attr.enabled, true);
       assert.equal(attr.$select.is(':disabled'), false);
       assert.equal(attr.$searchBar.is(':disabled'), false);
       assert.equal(attr.bodyGrid.getOptions().editable, true);

        // and they should remain the same after "enabling" them again
        attr.setEnabled(true);
       assert.equal(attr.enabled, true);
       assert.equal(attr.$select.is(':disabled'), false);
       assert.equal(attr.$searchBar.is(':disabled'), false);
       assert.equal(attr.bodyGrid.getOptions().editable, true);

        done();
      });
    });

    /**
     *
     * Test large dataset.
     *
     */
    QUnit.test('Test large dataset', function(assert) {
      const done = assert.async();
      var state = new UIState();
      var coords = [], metadata = [];
      for (var i = 0; i < 1001; i++) {
        coords.push([Math.random(), Math.random(), Math.random(),
                     Math.random()]);
        metadata.push([i, 'b ' + Math.random(), 'c ' + Math.random()]);
      }

      var data = {coordinates: coords, percents_explained: [45, 35, 15, 5],
                  sample_ids: _.range(1001), name: 'pcoa'};

      var d = new DecompositionModel(data, ['SampleID', 'foo', 'bar'],
                                     metadata);
      var mm = new MultiModel({'scatter': d});
      var dv = new DecompositionView(mm, 'scatter', state);
      var container = $('<div id="does-not-exist"></div>');
      // create a dummy category selection callback
      var options = {'categorySelectionCallback': function() {}};
      var attr = new EmperorAttributeABC(state, container, 'foo', 'bar',
                                         {'scatter': dv}, options);
      $(function() {
        // Controllers should be enabled
       assert.equal(attr.enabled, false);
       assert.equal(attr.$select.val(), null);
       assert.equal(attr.$select.is(':disabled'), false);

        done();
      });
    });

  });
});
