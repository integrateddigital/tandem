import { FactoryFragment } from 'common/fragments';
import React from 'react';
import assertPropertyExists from 'common/utils/assert/property-exists';

export class ReactComponentFactoryFragment extends FactoryFragment {
  constructor(ns, ComponentClass, props = {}) {
    super(ns, {
      create(props, children) {
        return <ComponentClass {...props}>{children}</ComponentClass>;
      }
    });

    Object.assign(this, props);
  }
}
