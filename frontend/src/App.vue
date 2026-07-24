<script setup>
  	import AppNavSidebar from './components/SideBar.vue'
</script>

<template>
	<div class="flex h-screen w-screen ">
		<AppNavSidebar class="h-full border-r border-slate-200/10"/>
		<div class="bg-zinc-950 w-full">
			<main class="max-w-7xl flex-1 h-full overflow-y-auto px-4 md:px-8 text-slate-300 mx-auto">
				<RouterView />
			</main>
		</div>
	</div>
</template>
