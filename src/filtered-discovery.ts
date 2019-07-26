import { Service } from './service';
import { Discovery } from './discovery';

import { LayeredDiscovery } from './internal';
import { ServicePredicate } from './predicate';

/**
 * Provides filtering of any discovery instance.
 */
export class FilteredDiscovery<S extends Service> extends LayeredDiscovery<S, S> {
	private predicate: ServicePredicate<S>;

	constructor(
		parent: Discovery<S>,
		predicate: ServicePredicate<S>
	) {
		super('filtered', parent);

		this.predicate = predicate;
	}

	/**
	 * Get all of the available services.
	 */
	get services() {
		return this.parent.services
			.filter(this.predicate);
	}

	public get(id: string) {
		const service = this.parent.get(id);
		if(service && this.predicate(service)) {
			return service;
		}

		return null;
	}

	protected handleParentServiceAvailable(service: S) {
		if(this.predicate(service)) {
			this.updateService(service);
		}
	}

	protected handleParentServiceUnavailable(service: S) {
		this.removeService(service);

	}

	protected handleParentServiceUpdate(service: S) {
		if(this.predicate(service)) {
			/*
			 * Either the service still matches or it now matches. Make it
			 * available in this discovery.
			 */
			this.updateService(service);
		} else {
			/*
			 * Remove the service is if it no longer matches.
			 */
			this.removeService(service.id);
		}
	}
}
