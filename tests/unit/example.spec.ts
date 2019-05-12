import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import { DetectorValues } from '../../src/lib/RPMProfile'

describe('DetectorValues', () => {
  const values = new DetectorValues("GB", 0, [250, 250, 250, 250]);
  it('constructor works', () => {
    expect(values.Counts.length).to.equal(4);
  });
  it('ToString check', () => {
    const str = values.ToString();
    expect(str).to.equal("GB,000250,000250,000250,000250");
  });
  it('TotalCounts check', () => {
    expect(values.TotalCounts()).to.equal(1000);
  });
})
