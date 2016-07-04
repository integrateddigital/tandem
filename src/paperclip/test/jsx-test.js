import { dom, TemplateComponent, freeze, FragmentSection } from '../index';
import expect from 'expect.js';

describe(__filename + '#', function() {
  it('can render various elements', function() {
    class SubController extends TemplateComponent {
      static template = <div class='some-class'>
        hello {c => c.name}
      </div>
    }

    var c = SubController.create({ name: 'joe' });
    expect(c.section.toString()).to.be(`<div class=\"some-class\">hello joe</div>`);
  });

  it('can render with a component', function() {

    class Repeat {

      constructor({ view, childNodesTemplate }) {
          this.view               = view;
          this.attributes         = {};
          this.childNodesTemplate = childNodesTemplate;
      }

      setAttribute(key, value) {
        this.attributes[key] = value;
      }

      update() {
        var { section, context }   = this.view;
        var { each, as }        = this.attributes;
        var childNodesTemplate  = this.childNodesTemplate;

        each.forEach(function(item, index) {
          section.appendChild(childNodesTemplate.createView({
            [as]: item
          }).toFragment());
        });
      }
    }

    class SubController extends TemplateComponent {
      static template = <Repeat each={c=>c.items} as='item'>
        item: {c=>c.item}
      </Repeat>
    }

    var c = SubController.create({ items: [1, 2, 3, 4 ]});


    expect(c.section.toString()).to.be('item: 1item: 2item: 3item: 4');
  });
});
