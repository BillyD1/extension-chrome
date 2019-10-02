import React from 'dom-chef';
import onDomReady from 'dom-loaded';

import { isGitHub, isRepoRoot } from '../libs/page-detect';
import { getRepoDetails } from '../libs/utils';
import { clippy } from '../libs/icons';

import './github-download-button.css';

async function init () {
	await onDomReady;

	if (isGitHub()) {
		if (isRepoRoot()) {
			try {
				if (document.querySelector('.jsd-get-repo-select-menu')) {
					return;
				}

				const { ownerName, repoName, treeName } = getRepoDetails();

				const rawPackageUrl = `https://raw.githubusercontent.com/${ownerName}/${repoName}/${treeName}/package.json`;
				const rawPackageResponse = await fetch(rawPackageUrl);
				const { name } = await rawPackageResponse.json();

				if (!name) {
					return;
				}

				const packageVersionsUrl = `https://data.jsdelivr.com/v1/package/npm/${name}`;
				const packageVersionsResponse = await fetch(packageVersionsUrl);
				const { tags, versions } = await packageVersionsResponse.json();

				const version = tags.latest ? tags.latest : versions[0];

				const packageFilesUrl = `https://data.jsdelivr.com/v1/package/npm/${name}@${version}`;
				const packageFilesResponse = await fetch(packageFilesUrl);
				const { default: defaultFile } = await packageFilesResponse.json();

				const cdnUrl = defaultFile ? `https://cdn.jsdelivr.net/npm/${name}@${version}${defaultFile}` : '';

				const menu = (
					<details class="jsd-get-repo-select-menu dropdown details-reset details-overlay">
						<summary class="btn btn-sm ml-2 jsd-btn-orange">
							jsDelivr CDN
							&nbsp;
							<span class="dropdown-caret"></span>
						</summary>

						<div class="position-relative">
							<div class="get-repo-modal dropdown-menu dropdown-menu-sw pb-0">
								<div class="get-repo-modal-options">
									<div class="clone-options">
										<h4 class="mb-1">
											Serve with jsDelivr CDN
										</h4>
										{cdnUrl
											? (
												<div>
													<p class="mb-2 get-repo-decription-text">
														Use this URL in your web page.
													</p>
													<div class="input-group">
														<input
															type="text"
															class="form-control input-monospace input-sm"
															value={cdnUrl}
															aria-label={`Load this repository at ${cdnUrl}`}
															readonly
														/>
														<div class="input-group-button">
															<clipboard-copy
																class="btn btn-sm"
																value={cdnUrl}
																tabindex="0"
																role="button"
																aria-label="Copy to clipboard"
															>
																{clippy()}
															</clipboard-copy>
														</div>
													</div>
												</div>
											)
											: (
												<div class="flash flash-warn mt-2 jsd-flash">
													Sadly, this package doesn't have a default file set.
												</div>
											)
										}
									</div>
									<div class="mt-2">
										<a
											class="btn btn-outline get-repo-btn tooltipped tooltipped-s tooltipped-multiline"
											href={`https://www.jsdelivr.com/package/npm/${name}`}
											target="_blank"
											rel="nofollow"
											aria-label={`Open ${ownerName}/${repoName} in jsDelivr website and select the files you want to use.`}
										>
											Open in jsDelivr
										</a>
										{cdnUrl
											? (
												<a
													class="btn btn-outline get-repo-btn"
													href={`https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`}
													rel="nofollow"
												>
													Download ZIP
												</a>
											)
											: null
										}
									</div>
								</div>
							</div>
						</div>
					</details>
				);

				const fileNavigation = document.querySelector('.file-navigation');

				if (fileNavigation) {
					fileNavigation.append(menu);
				}
			} catch (error) {
				console.error(error);
			}
		}
	}
}

init();

document.addEventListener('pjax:end', init);
