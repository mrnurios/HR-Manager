<script setup>
  	import AppNavSidebar from './components/SideBar.vue'
  	import AppNavTopbar from './components/TopBar.vue'
</script>

<template>
	<div class="flex flex-col h-dvh overflow-hidden">
		<AppNavTopbar class="w-full shrink-0 border-b border-slate-200/10"/>
		<div class="flex flex-1 min-h-0">
			<AppNavSidebar class="hidden md:flex shrink-0 border-r border-slate-200/10"/>
			<div class="min-w-0 min-h-0 w-full overflow-y-auto">
				<main class="max-w-7xl w-full h-full flex flex-col flex-1 px-2 md:px-4 text-slate-300 mx-auto">
					<RouterView />
				</main>
			</div>
		</div>
	</div>
</template>
